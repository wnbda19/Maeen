"""Architecture sizes only; does not train or retain random weight checkpoints."""
from pathlib import Path
import json

from maeen_data.models import make_model
import argparse

parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--vocabulary',type=Path,default=Path('config/vocabulary.reference25.json'))
parser.add_argument('--output',type=Path,default=Path('../docs/phase3/architecture-structure.reference25.json'))
args=parser.parse_args()
vocabulary=json.loads(args.vocabulary.read_text(encoding='utf-8'))
classes=len(vocabulary['proposedWords'])+len(vocabulary['negativeClasses'])

result = {"scope":"untrained architecture parameter counts, not trained model performance or size", "classes":classes,
          "shape":[1,32,268],"architectures":{}}
for architecture in ("tcn","gru","bilstm","stgcn"):
    model = make_model(architecture,classes)
    count = sum(parameter.numel() for parameter in model.parameters())
    result["architectures"][architecture] = {"parameters":count,"fp32ParameterBytes":count*4,
                                              "signerIndependentAccuracy":None,"macroF1":None,"browserLatencyMs":None}
path = args.output
path.parent.mkdir(parents=True,exist_ok=True)
path.write_text(json.dumps(result,indent=2),encoding="utf-8")
print(json.dumps(result,indent=2))
