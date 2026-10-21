"""Public metadata contract only: no media access, extraction or training."""
import copy
import unittest
from pathlib import Path

from maeen_data.dataset import read_json
from maeen_data.library_poc import plan_poc


class LibraryPocTests(unittest.TestCase):
    def setUp(self):
        self.observations = read_json(Path(__file__).resolve().parents[2] / 'docs/phase3/official-library-poc-observations.json')

    def test_frozen_shortlist_yields_only_blocked_metadata_plan(self):
        plan = plan_poc(self.observations)
        self.assertEqual(plan['observedRecords'], 25)
        self.assertAlmostEqual(plan['nominalSeconds'], 86.96)
        self.assertEqual(plan['minimumEngineeringSubset'], ['5018'])
        self.assertFalse(plan['downloadAuthorized'])
        self.assertFalse(plan['signerIndependentEvaluationPossible'])
        self.assertFalse(plan['trainingReady'])
        self.assertEqual(plan['libraryTensorsProduced'], 0)
        self.assertEqual(plan['expectedTensorShapeAfterAuthorizedExtraction'], [1, 32, 268])

    def test_rejects_extra_missing_duplicate_or_unlisted_terms(self):
        for change in ('extra', 'missing', 'duplicate', 'unlisted'):
            data = copy.deepcopy(self.observations)
            if change == 'extra': data['records'].append(data['records'][0])
            elif change == 'missing': data['records'].pop()
            elif change == 'duplicate': data['records'][0] = data['records'][1]
            else: data['records'][0]['officialTermId'] = '999999'
            with self.subTest(change=change), self.assertRaises(ValueError):
                plan_poc(data)

    def test_rejects_arbitrary_urls_bad_dimensions_and_invalid_duration(self):
        for key, value in [('videoUrl', 'https://example.org/file.mp4'),
                           ('videoUrl', 'https://sshi.sa/api/file/../private.mp4'),
                           ('pageUrl', 'https://sshi.sa/category/1/30'),
                           ('width', 0), ('durationSeconds', float('nan'))]:
            data = copy.deepcopy(self.observations)
            data['records'][0][key] = value
            with self.subTest(key=key, value=value), self.assertRaises(ValueError):
                plan_poc(data)

    def test_robots_or_claimed_permission_never_enable_training(self):
        data = copy.deepcopy(self.observations)
        data['robots']['text'] = 'User-agent: *\nDisallow:'
        data['records'][0]['rightsStatus'] = 'approved'
        plan = plan_poc(data)
        self.assertFalse(plan['downloadAuthorized'])
        self.assertFalse(plan['trainingReady'])
