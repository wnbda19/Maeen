"""Small comparison candidates. Construction is not training or validation."""
import torch
from torch import nn

FEATURE_WIDTH = 268


class TemporalCNN(nn.Module):
    def __init__(self, classes, hidden=64, dropout=0.2):
        super().__init__()
        layers = []
        channels = FEATURE_WIDTH
        for dilation in (1, 2, 4):
            layers.extend([nn.Conv1d(channels, hidden, 3, padding=dilation, dilation=dilation),
                           nn.ReLU(), nn.Dropout(dropout)])
            channels = hidden
        self.temporal = nn.Sequential(*layers, nn.AdaptiveAvgPool1d(1))
        self.output = nn.Linear(hidden, classes)

    def forward(self, values):
        return self.output(self.temporal(values.transpose(1, 2)).squeeze(-1))


class Recurrent(nn.Module):
    def __init__(self, classes, bidirectional=False, dropout=0.2):
        super().__init__()
        self.sequence = nn.LSTM(FEATURE_WIDTH, 32, batch_first=True, bidirectional=True) if bidirectional else nn.GRU(FEATURE_WIDTH, 64, batch_first=True)
        self.output = nn.Sequential(nn.Dropout(dropout), nn.Linear(64, classes))

    def forward(self, values):
        _, hidden = self.sequence(values)
        if isinstance(hidden, tuple):
            hidden = hidden[0]
        return self.output(hidden.transpose(0, 1).reshape(values.shape[0], -1))


def adjacency():
    matrix = torch.eye(67)
    hand_edges = [(0, 1), (1, 2), (2, 3), (3, 4), (0, 5), (5, 6), (6, 7), (7, 8),
                  (5, 9), (9, 10), (10, 11), (11, 12), (9, 13), (13, 14), (14, 15), (15, 16),
                  (13, 17), (0, 17), (17, 18), (18, 19), (19, 20)]
    edges = hand_edges + [(a + 21, b + 21) for a, b in hand_edges]
    edges += [(42 + a, 42 + b) for a, b in [(0, 1), (0, 2), (2, 4), (1, 3), (3, 5), (0, 6), (1, 7), (6, 7)]]
    edges += [(0, 46), (21, 47)] + [(50, point) for point in range(51, 67)]
    for a, b in edges:
        matrix[a, b] = matrix[b, a] = 1
    return matrix / matrix.sum(dim=1, keepdim=True)


class SmallSTGCN(nn.Module):
    """Compact fixed-graph spatial propagation + temporal convolution baseline."""
    def __init__(self, classes, dropout=0.2):
        super().__init__()
        self.register_buffer("graph", adjacency())
        self.first = nn.Conv2d(4, 32, (3, 1), padding=(1, 0))
        self.second = nn.Conv2d(32, 64, (3, 1), padding=(1, 0))
        self.dropout = nn.Dropout(dropout)
        self.output = nn.Linear(64, classes)

    def forward(self, values):
        value = values.reshape(values.shape[0], values.shape[1], 67, 4).permute(0, 3, 1, 2)
        value = torch.relu(self.first(torch.matmul(value, self.graph)))
        value = self.dropout(torch.relu(self.second(torch.matmul(value, self.graph))))
        return self.output(value.mean(dim=(2, 3)))


def make_model(architecture, classes):
    if type(classes) is not int or classes < 2:
        raise ValueError("At least two classes required")
    factories = {"tcn": lambda: TemporalCNN(classes), "gru": lambda: Recurrent(classes),
                 "bilstm": lambda: Recurrent(classes, True), "stgcn": lambda: SmallSTGCN(classes)}
    if architecture not in factories:
        raise ValueError("Unknown architecture")
    return factories[architecture]()
