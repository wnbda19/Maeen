"""Authorization gates use invented text fixtures, never library media."""
import copy
import tempfile
import unittest
from pathlib import Path
from datetime import date, timedelta

from maeen_data.dataset import ingest, sha256_file
from maeen_data.official import ingest_official


class OfficialIngestionTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        (self.root / 'permission.txt').write_text('UNIT TEST ONLY: not real permission')
        self.grant = {'source': 'saudi-sign-library', 'status': 'approved',
                      'issuer': 'Saudi Hearing Disability Association', 'reviewedBy': 'UNIT-REVIEWER',
                      'expiresOn': (date.today() + timedelta(days=1)).isoformat(),
                      'evidenceFile': 'permission.txt', 'evidenceSha256': sha256_file(self.root / 'permission.txt'),
                      'termIds': ['5018'], 'rights': {key: True for key in (
                          'programmaticAccess', 'downloadStore', 'landmarkExtraction', 'mlTraining',
                          'modelRedistribution', 'competitionDemo', 'publicWebDeployment')}}
        self.rows = []
        self.splits = {'train': ['S001'], 'validation': ['S002'], 'test': ['S003']}
        for i in range(1, 4):
            file = self.root / f'fixture{i}.mp4'
            file.write_text(f'not a video: fixture {i}')
            self.rows.append({'clipId': f'official-{i}', 'file': file.name, 'wordId': 'W001',
                              'signerId': f'S00{i}', 'signerEvidence': 'association-metadata',
                              'sessionId': f'official-session-{i}', 'sessionEvidence': 'association-metadata',
                              'officialTermId': '5018', 'officialUrl': 'https://sshi.sa/category/14/5018',
                              'captureType': 'real-camera', 'mirrored': False,
                              'qc': {'accepted': True, 'languageReviewer': 'Q1', 'technicalReviewer': 'Q2'}})

    def tearDown(self):
        self.temp.cleanup()

    def test_requires_explicit_current_rights_and_matching_evidence(self):
        for mutate in ('missing', 'expired', 'revoked', 'hash', 'scope', 'rights'):
            grant = copy.deepcopy(self.grant)
            if mutate == 'missing': grant = {}
            elif mutate == 'expired': grant['expiresOn'] = '2000-01-01'
            elif mutate == 'revoked': grant['status'] = 'revoked'
            elif mutate == 'hash': grant['evidenceSha256'] = '0' * 64
            elif mutate == 'scope': grant['termIds'] = ['other']
            elif mutate == 'rights': grant['rights']['mlTraining'] = False
            with self.subTest(mutate=mutate), self.assertRaises(ValueError):
                ingest_official(self.root, self.rows, grant, self.splits, ['W001'])

    def test_local_authorized_staging_retains_source_and_split(self):
        rows = ingest_official(self.root, self.rows, self.grant, self.splits, ['W001'])
        self.assertEqual([r['split'] for r in rows], ['train', 'validation', 'test'])
        self.assertTrue(all(r['source'] == 'saudi-sign-library' for r in rows))

    def test_rejects_unknown_signers_duplicates_bad_urls_and_path_escape(self):
        for field, value in [('signerId', None), ('signerEvidence', 'visual-guess'),
                             ('officialUrl', 'https://example.org/5018'), ('file', '../escape.mp4')]:
            rows = copy.deepcopy(self.rows)
            rows[0][field] = value
            with self.subTest(field=field), self.assertRaises(ValueError):
                ingest_official(self.root, rows, self.grant, self.splits, ['W001'])
        (self.root / self.rows[1]['file']).write_bytes((self.root / self.rows[0]['file']).read_bytes())
        with self.assertRaises(ValueError):
            ingest_official(self.root, self.rows, self.grant, self.splits, ['W001'])

    def test_first_party_ingester_cannot_relabel_official_source(self):
        with self.assertRaisesRegex(ValueError, 'source'):
            ingest(self.root, [{**self.rows[0], 'source': 'saudi-sign-library'}], [], self.splits, ['W001'])


if __name__ == '__main__':
    unittest.main()
