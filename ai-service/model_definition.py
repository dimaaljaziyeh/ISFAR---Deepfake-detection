import torch
import torch.nn as nn
import torchvision.models as models

class MesoNet(nn.Module):
    def __init__(self, num_classes=2):
        super(MesoNet, self).__init__()
        self.conv1 = nn.Sequential(
            nn.Conv2d(3, 8, 3, padding=1),
            nn.BatchNorm2d(8),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2)
        )
        self.conv2 = nn.Sequential(
            nn.Conv2d(8, 8, 5, padding=2),
            nn.BatchNorm2d(8),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2)
        )
        self.conv3 = nn.Sequential(
            nn.Conv2d(8, 16, 5, padding=2),
            nn.BatchNorm2d(16),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2)
        )
        self.conv4 = nn.Sequential(
            nn.Conv2d(16, 16, 5, padding=2),
            nn.BatchNorm2d(16),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(4, 4)
        )
        self.fc1 = nn.Linear(16 * 8 * 8, 16)
        self.drop = nn.Dropout(0.5)
        self.fc2 = nn.Linear(16, num_classes)

    def forward(self, x):
        x = self.conv1(x)
        x = self.conv2(x)
        x = self.conv3(x)
        x = self.conv4(x)
        x = x.view(x.size(0), -1)
        x = self.fc1(x)
        x = self.drop(x)
        x = self.fc2(x)
        return x

class FeatureFusionModel(nn.Module):
    def __init__(self, mesonet, efficientnet, num_classes=2, fusion_dim=512):
        super(FeatureFusionModel, self).__init__()
        self.mesonet_features = nn.Sequential(
            mesonet.conv1,
            mesonet.conv2,
            mesonet.conv3,
            mesonet.conv4
        )
        self.efficientnet_features = efficientnet.features
        self.meso_adaptive_pool = nn.AdaptiveAvgPool2d((1, 1))
        self.meso_fc = nn.Linear(16, fusion_dim)
        self.eff_fc = nn.Linear(1792, fusion_dim)
        self.classifier = nn.Sequential(
            nn.Linear(fusion_dim * 2, 256),
            nn.ReLU(inplace=True),
            nn.Dropout(0.5),
            nn.Linear(256, num_classes)
        )

    def forward(self, x):
        meso_feat = self.mesonet_features(x)
        meso_feat = self.meso_adaptive_pool(meso_feat)
        meso_feat = meso_feat.view(meso_feat.size(0), -1)
        meso_feat = self.meso_fc(meso_feat)
        eff_feat = self.efficientnet_features(x)
        eff_feat = eff_feat.mean([2, 3])
        eff_feat = self.eff_fc(eff_feat)
        combined = torch.cat((meso_feat, eff_feat), dim=1)
        out = self.classifier(combined)
        return out
