"""Offline observation audit/dry run for exactly the frozen 25-term shortlist.

No network client, media copying, inference, tensors or training. A public URL,
robots policy or metadata flag is never transformed into legal authorization.
"""
import argparse
import math
from urllib.parse import unquote, urlparse

from .dataset import read_json, write_json

SHORTLIST = frozenset(('972', '5018', '11081', '5078', '9173', '9533', '5591',
                      '5476', '2023', '11211', '6515', '4586', '8425', '10664',
                      '4857', '4858', '4859', '4863', '4864', '4872', '4874',
                      '4877', '5463', '904', '5469'))


def plan_poc(observations):
    rows = observations.get('records', [])
    if observations.get('schemaVersion') != 'maeen-official-observation-v1' or len(rows) != 25:
        raise ValueError('Exactly the frozen 25 observed term records are required')
    ids = [row.get('officialTermId') for row in rows]
    if len(set(ids)) != 25 or set(ids) != SHORTLIST:
        raise ValueError('Shortlist changed, duplicated or expanded')
    for row in rows:
        term, category = row['officialTermId'], row.get('categoryId')
        page, media = urlparse(row.get('pageUrl', '')), urlparse(row.get('videoUrl', ''))
        if type(category) is not int or category < 1 or row.get('termId') != int(term):
            raise ValueError('Term/category metadata mismatch')
        for url in (page, media):
            if url.scheme != 'https' or url.netloc != 'sshi.sa' or url.query or url.fragment:
                raise ValueError('Only observed official HTTPS URLs accepted')
        filename = row.get('video', '')
        if not isinstance(filename, str) or not filename.endswith('.mp4') or any(x in filename for x in ('/', '\\', '..')):
            raise ValueError('Unsafe media filename')
        if page.path != f'/category/{category}/{term}' or unquote(media.path) != '/api/file/' + filename:
            raise ValueError('Page/API/player provenance mismatch')
        duration = row.get('durationSeconds')
        if type(duration) not in (float, int) or not math.isfinite(duration) or not 0 < duration <= 10:
            raise ValueError('Real finite short-clip duration required')
        if any(type(row.get(k)) is not int or row[k] <= 0 for k in ('width', 'height')):
            raise ValueError('Loaded media dimensions required')
        if row.get('observedMediaCount') != 1:
            raise ValueError('Observed one-reference-per-record assumption changed; re-audit')
    return {
        'schemaVersion': 'maeen-official-poc-plan-v1',
        'mode': 'metadata-only-dry-run',
        'observedRecords': len(rows),
        'uniqueMediaUrls': len({r['videoUrl'] for r in rows}),
        'nominalSeconds': round(sum(r['durationSeconds'] for r in rows), 2),
        'minimumEngineeringSubset': ['5018'],
        'subsetMeaning': 'Future one-clip decoder/landmark/normalizer check only, after a reviewed lawful basis; never a training split',
        'downloadAuthorized': False,
        'trainingReady': False,
        'signerIndependentEvaluationPossible': False,
        'libraryTensorsProduced': 0,
        'expectedTensorShapeAfterAuthorizedExtraction': [1, 32, 268],
        'blockers': [
            'No established license or reviewed applicable exception for copying/landmark extraction',
            'One exposed clip per class; no independent repeated takes for three partitions',
            'No provider signer/session IDs or per-class signer coverage',
            'No authorized real No Sign/out-of-vocabulary corpus',
            'Full temporal landmark coverage and normalization acceptance not measured on library footage',
        ],
        'futureSteps': [
            'Review a subset-specific grant or qualified legal determination; do not infer it from robots.txt',
            'Acquire at most the approved one-clip engineering subset and hash original bytes privately',
            'Use maeen_data.extract.extract_clip with original frame dimensions/timestamps and no invented signer',
            'Apply the existing shared prepareSequence function; report masks/gaps/body/face/hand coverage',
            'Keep engineering tensors outside all training partitions; obtain repeated authorized samples before fitting',
        ],
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--observations', required=True)
    parser.add_argument('--output', required=True)
    args = parser.parse_args()
    report = plan_poc(read_json(args.observations))
    write_json(args.output, report)
    print('25 observed records checked. Metadata-only plan written; zero media downloads, tensors or training.')


if __name__ == '__main__':
    main()
