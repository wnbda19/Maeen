import copy
import tempfile
import unittest
from unittest.mock import patch
from pathlib import Path
from maeen_data.dataset import read_json
from maeen_data.collection import progress_report, import_exports, validate_collection_ready


class CollectionTests(unittest.TestCase):
    def setUp(self):
        self.profile=read_json(Path(__file__).resolve().parents[2]/'collection/profiles.json')['profiles'][0]

    def test_real_target_and_retakes_do_not_inflate_coverage(self):
        row={'profileId':'reference25','source':'first-party','signerId':'S001','wordId':'W101','repetition':1,'qc':{'accepted':False}}
        report=progress_report([row,{**row,'take':2}],self.profile)
        self.assertEqual(report['recordedPositiveSlots'],1)
        self.assertEqual(report['remainingPositive'],5625)
        self.assertEqual(report['remainingNegative'],150)
        self.assertFalse(report['trainingReady'])

    def test_training_gate_requires_every_real_signer_word_slot(self):
        with self.assertRaisesRegex(ValueError,'collection incomplete'):
            validate_collection_ready([],self.profile)

    def test_reference_architectures_support_both_profile_class_orders(self):
        import torch
        from maeen_data.models import make_model
        for profile,classes in [('reference25',27),('mvp15',17)]:
            for architecture in ('gru','bilstm','tcn'):
                model=make_model(architecture,classes).eval()
                with torch.no_grad():output=model(torch.zeros(1,32,268))
                self.assertEqual(list(output.shape),[1,classes],(profile,architecture))

    def test_import_requires_consent_and_preserves_pending_qc(self):
        with tempfile.TemporaryDirectory() as folder:
            root=Path(folder);exports=root/'exports';exports.mkdir()
            name='S001_W101_C01_R01_T01'
            (exports/(name+'.webm')).write_bytes(b'unit file only; not a real recording')
            row={'schemaVersion':'maeen-collection-v2','profileId':'reference25','clipId':name,'file':f'raw/S001/C01/W101/{name}.webm','signerId':'S001','sessionId':'C01','wordId':'W101','repetition':1,'take':1,'consent':True,'consentRef':'C-S001-v2','source':'first-party','captureType':'real-camera','mirrored':False,'durationSeconds':4,'officialTermId':'972','condition':'bright-plain','speed':'comfortable','distanceMetres':1.5}
            from maeen_data.dataset import write_json
            write_json(exports/(name+'.json'),row)
            with self.assertRaises(ValueError):import_exports(exports,root/'dataset',[],self.profile)
            consents=[{'signerId':'S001','consentRef':'C-S001-v2','recording':True,'training':True,'modelDistribution':True,'withdrawn':False}]
            with patch('maeen_data.collection.probe_recording',return_value={'durationSeconds':4,'fps':30,'frames':120,'width':640,'height':480}):
                imported=import_exports(exports,root/'dataset',consents,self.profile)
            self.assertEqual(len(imported),1)
            self.assertFalse(imported[0]['qc']['accepted'])
            self.assertTrue((root/'dataset'/row['file']).is_file())
            self.assertEqual(import_exports(exports,root/'dataset',consents,self.profile),imported)

    def test_official_video_provenance_rejected_and_signer_split_is_disjoint(self):
        from maeen_data.collection import validate_export
        with self.assertRaises(ValueError):validate_export({'source':'saudi-sign-library'},[],self.profile)
        self.assertEqual(len(set(sum(list(self.profile['splits'].values()),[]))),15)

    def test_webm_decoder_duration_probe_is_not_training_data(self):
        import cv2
        import numpy as np
        from maeen_data.collection import probe_recording
        with tempfile.TemporaryDirectory() as folder:
            file=Path(folder)/'blank-unit-decoder.webm'
            writer=cv2.VideoWriter(str(file),cv2.VideoWriter_fourcc(*'VP80'),30,(640,480))
            self.assertTrue(writer.isOpened())
            for _ in range(96):writer.write(np.zeros((480,640,3),dtype=np.uint8))
            writer.release()
            result=probe_recording(file)
            self.assertAlmostEqual(result['durationSeconds'],3.2,places=1)
            self.assertEqual(result['frames'],96)
