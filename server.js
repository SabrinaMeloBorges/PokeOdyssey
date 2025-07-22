const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert({
    "type": "service_account",
    "project_id": "pokellentt",
    "private_key_id": "44fdc32522f569f693155ac06ba2811df15a4adb",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQC3C8d0HlPvYV+x\nxYvV77Uqnken1HERdaEh0902F8ivnHl9+DP3oIqnyUwwPNWD16yGQwZjuck3RUJX\n/pLgDDhi/oxuEq10aX8MU/ZKI0deW0RRXahFt61UQ8X6Vgghkr39doCs+TFxckV6\nJcegCDanCCdIkSFpWdQldZ6WWhJzLP0qRqVQxKPXQ+/FzMvAmsd3fsWUI4ygiarR\nXRu841/hezdm35C2Z/YJ3UtWrRGT7vqE7f2mca9QXMgvoisSUDeSsXn0zX0AQVLF\nJ+mgjh11x+LCPGOrKYFXocUL9rivnFFMkUlY3GY9+ImL6jMymyr9508yzZcQOv8I\nYF/s+tORAgMBAAECggEAAxq8icAf7U3p+RJgIkM7/9qKXZLRThoAHxpARLQXj77o\nIpZMj1UWNO1JkQHfHyrPvsExQQy8GGdgziw/onQimq81g4JmlbRaVsOvyCccBUIo\nAPdFLNWGJ4k0uN+vqJ4cAcn6ObTKPWHSQtWUMqchAik1vVnUxrwiyHXbuDIT4Qcp\nasOVeJLE7d6Q0p7jfYH3INZ8ATi9t7jEn2Kv4dwJ0mIBrgrVSSQOVf9PG8Us1KVu\nW764Qw6ZtG1zEUOYa/lwu7PyPO4HbU5OCEoL35rpyD2og/UThB2Yh+VcIet5Hily\ng2RCBke2CHaAkWxC2IKGjgUcOazLVhv6AIbhPsrxCQKBgQDxzEEEpXT72bvY3yKO\nEieKPkSyImSkZoYZ8rk81/vDiLAt01jPvt5Zsgv6AaJKLfyfuKe06bdx3DM+mo/N\nsPfsWPArd3gu2bFoa2TJbPv9CS9mcHuTLNAVqbfzYPNNo7BaJwraJX8uQN5xcCek\nAkRnW3zFLJoanGbeq6UXk1L7jQKBgQDBzB1L4B03N5LBS2GMtHLcw9pqHLOFMqWh\npcuKAr/WwD79ILWMWE7idogqvEZojDwOSpY0D1Ql9Gokpzq+NqcD6KQvT1KwiPhn\nDALjBEoQCTn+4kHqIUZFN8jgdY4Pzxo4Ijz7V1rX58oNEgLBrnfqUU5Ev1+W9h4I\nhfxme3g1FQKBgQC3cehOFx1mya0Lf1ZfBQT8i/tgTlmepK3O1+iTcaVvlq9bRQIX\nMs7MrBkMBttSfgswPk72IW7sskwqjebV/hJKPLuRrqT+nmhLOVcQvl97fNF6XZJT\neWcxWD7YJdDRMYPlEcPY9yPDOrHIzHc2pgWxiKZjjVApKkmdXAn3le0aLQKBgQCt\nagy9HKqIAn6b4OxFkCNIUSlc0poBkrSL1WQw9wzbCeRTdbV/BHZyR0bJlvgaDYKf\n9zY5F45g+DkS22HBW/5PjRl+DCkeNzKwYxsiMXBksRzoa2Y4L9ZFkgl6cTbSBqyb\nlmejMSPlF1DCKV+2GHzNfDvhYK4U099EGUEmI04JkQKBgQDWlnoULMTE/ef/y1cY\npRt2/9yJkyhdDcOIeQC3NGtRNGGN3tIXodC4IFheYu0xXShlTTltzf5/piWyFeLp\nNsO4iwp1vQzemijeUVAeifCLE/KjPvWtsqC/HYL8+M8O4VkKa7/cHwysYQARcArt\noMJA4Saqy2yb65HXsylMUcP6Ew==\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-fbsvc@pokellentt.iam.gserviceaccount.com",
    "client_id": "113366967879928073199",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40pokellentt.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"
  }),
});

const app = express();
const port = 3000;

app.use(bodyParser.json());

const db = admin.firestore();

app.post('/add-pokemon', async (req, res) => {
  try {
    const { name, imageUrl, captureRate, type } = req.body;

    if (!name || !imageUrl || !captureRate || !type) {
      return res.status(400).json({ message: 'Todos os campos são necessários' });
    }

    const pokemonRef = db.collection('pokemons').doc();
    
    await pokemonRef.set({
      name,
      imageUrl,
      captureRate,
      type,
      capturedBy: null, 
      createdAt: admin.firestore.FieldValue.serverTimestamp() 
    });

    res.status(201).json({ message: 'Pokémon adicionado com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao adicionar Pokémon', error });
  }
});

app.get('/pokemons', async (req, res) => {
  try {
    const snapshot = await db.collection('pokemons').get();
    const pokemons = snapshot.docs.map(doc => doc.data());

    res.status(200).json(pokemons);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao recuperar Pokémons', error });
  }
});

app.post('/capture-pokemon', async (req, res) => {
  try {
    const { pokemonId, userId } = req.body;

    if (!pokemonId || !userId) {
      return res.status(400).json({ message: 'pokemonId e userId são obrigatórios' });
    }

    const pokemonRef = db.collection('pokemons').doc(pokemonId);
    await pokemonRef.update({
      capturedBy: userId, 
      capturedAt: admin.firestore.FieldValue.serverTimestamp() 
    });

    res.status(200).json({ message: 'Pokémon capturado com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao capturar Pokémon', error });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});