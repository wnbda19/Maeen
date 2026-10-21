import unittest
import numpy as np
from phase5.asl import normalize, LABELS

class AslContractTests(unittest.TestCase):
    def test_static_classes_exclude_motion_letters(self):
        self.assertEqual(len(LABELS),24)
        self.assertNotIn('J',LABELS)
        self.assertNotIn('Z',LABELS)

    def test_translation_and_scale_invariant(self):
        p=np.arange(63,dtype=np.float32).reshape(21,3)/100
        np.testing.assert_allclose(normalize(p,'Right'),normalize(p*2+3,'Right'),atol=1e-5)

    def test_handedness_reflection(self):
        p=np.arange(63,dtype=np.float32).reshape(21,3)/100
        mirrored=p.copy();mirrored[:,0]*=-1
        np.testing.assert_allclose(normalize(p,'Right'),normalize(mirrored,'Left'))

    def test_invalid_and_collapsed_hand_rejected(self):
        for p in (np.zeros((21,3)),np.full((21,3),np.nan),np.zeros((20,3))):
            with self.assertRaises(ValueError):normalize(p,'Right')
