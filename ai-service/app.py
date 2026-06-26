from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
import torchvision.transforms as transforms
import torchvision.models as models
from PIL import Image
import io
from model_definition import MesoNet, FeatureFusionModel

app = Flask(__name__)
CORS(app)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# 1. إنشاء MesoNet و EfficientNet بنفس طريقة التدريب
mesonet_base = MesoNet(num_classes=2)
efficientnet_base = models.efficientnet_b4(weights=models.EfficientNet_B4_Weights.DEFAULT)

# 2. إنشاء نموذج الدمج وتمرير الكائنين
model = FeatureFusionModel(mesonet_base, efficientnet_base, num_classes=2).to(device)

# 3. تحميل الأوزان المحفوظة
model.load_state_dict(torch.load('model_weights.pth', map_location=device))
model.eval()
print("MODEL LOADED")

transform = transforms.Compose([
    transforms.Resize((256, 256)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

@app.route('/predict', methods=['POST'])
def predict():

    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400
    file = request.files['image']
    img_bytes = file.read()
    image = Image.open(io.BytesIO(img_bytes)).convert('RGB')
    input_tensor = transform(image).unsqueeze(0).to(device)
    with torch.no_grad():
        output = model(input_tensor)
    probs = torch.nn.functional.softmax(output[0], dim=0)
    fake_prob, real_prob = probs[0].item(), probs[1].item()
    predicted_class = 'fake' if fake_prob > real_prob else 'real'
    confidence = max(fake_prob, real_prob)
    return jsonify({
        'predicted_class': predicted_class,
        'confidence': confidence,
        'probabilities': {'fake': fake_prob, 'real': real_prob}
    })

if __name__ == '__main__':
   port = int(os.environ.get("PORT", 7860))
    app.run(host="0.0.0.0", port=port)
