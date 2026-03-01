const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
app.use(cors());
app.use(express.json());

// 内存存储
const users = new Map();
const inventory = new Map();

// 模拟的宝藏数据
const spawnedItems = [
  { id: '1', latitude: 39.9087, longitude: 116.3975, itemName: '水晶碎片', itemRarity: 'rare', poiName: '天安门广场', isActive: true },
  { id: '2', latitude: 39.9090, longitude: 116.3980, itemName: '普通石子', itemRarity: 'common', poiName: '故宫', isActive: true },
  { id: '3', latitude: 39.9100, longitude: 116.3990, itemName: '黄金罗盘', itemRarity: 'legendary', poiName: '景山公园', isActive: true },
  { id: '4', latitude: 39.9110, longitude: 116.4000, itemName: '四叶草', itemRarity: 'rare', poiName: '北海公园', isActive: true },
  { id: '5', latitude: 39.9120, longitude: 116.4010, itemName: '松果', itemRarity: 'common', poiName: '中山公园', isActive: true },
  { id: '6', latitude: 39.9130, longitude: 116.4020, itemName: '月光石', itemRarity: 'epic', poiName: '香山公园', isActive: true },
];

const itemDefinitions = {
  '水晶碎片': { id: '1', name: '水晶碎片', description: '闪闪发光的水晶碎片，蕴含着神秘能量。', rarity: 'rare', type: 'collectible' },
  '普通石子': { id: '2', name: '普通石子', description: '一颗普通的石子，虽然不起眼但也是收藏的一部分。', rarity: 'common', type: 'collectible' },
  '黄金罗盘': { id: '3', name: '黄金罗盘', description: '可以指引方向的神器，永远不会迷失。', rarity: 'legendary', type: 'collectible' },
  '四叶草': { id: '4', name: '四叶草', description: '传说中的幸运象征，能带来好运。', rarity: 'rare', type: 'collectible' },
  '松果': { id: '5', name: '松果', description: '从松树上掉落的果实，是大自然的礼物。', rarity: 'common', type: 'collectible' },
  '月光石': { id: '6', name: '月光石', description: '在月光下会发出淡蓝色光芒的石头。', rarity: 'epic', type: 'collectible' },
};

// 注册
app.post('/api/auth/register', async (req, res) => {
  const { email, password, username } = req.body;
  
  if (!email || !password || !username) {
    return res.status(400).json({ message: '请填写所有字段' });
  }
  
  if (users.has(email)) {
    return res.status(400).json({ message: '邮箱已存在' });
  }
  
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = {
    id: Date.now().toString(),
    email,
    username,
    password: hashedPassword,
    createdAt: new Date().toISOString()
  };
  
  users.set(email, user);
  inventory.set(user.id, []);
  
  const token = Buffer.from(JSON.stringify({ userId: user.id })).toString('base64');
  res.json({ user: { id: user.id, email, username }, token });
});

// 登录
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  const user = users.get(email);
  
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials', error: 'Unauthorized', statusCode: 401 });
  }
  
  const isValid = await bcrypt.compare(password, user.password);
  
  if (!isValid) {
    return res.status(401).json({ message: 'Invalid credentials', error: 'Unauthorized', statusCode: 401 });
  }
  
  const token = Buffer.from(JSON.stringify({ userId: user.id })).toString('base64');
  res.json({ user: { id: user.id, email: user.email, username: user.username }, token });
});

// 获取附近宝藏
app.get('/api/spawned-items/nearby', (req, res) => {
  res.json(spawnedItems.filter(item => item.isActive));
});

// 收集宝藏
app.post('/api/spawned-items/collect', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ message: '未登录' });
  }
  
  try {
    const { userId } = JSON.parse(Buffer.from(authHeader.replace('Bearer ', ''), 'base64').toString());
    const { spawnedItemId, latitude, longitude } = req.body;
    
    const spawnedItem = spawnedItems.find(item => item.id === spawnedItemId);
    
    if (!spawnedItem || !spawnedItem.isActive) {
      return res.status(400).json({ message: '宝藏不存在或已被收集' });
    }
    
    spawnedItem.isActive = false;
    
    const userInventory = inventory.get(userId) || [];
    const existingItem = userInventory.find(i => i.item && i.item.name === spawnedItem.itemName);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      userInventory.push({
        id: Date.now().toString(),
        itemId: spawnedItem.id,
        quantity: 1,
        collectedLatitude: latitude,
        collectedLongitude: longitude,
        poiName: spawnedItem.poiName,
        collectedAt: new Date().toISOString(),
        item: itemDefinitions[spawnedItem.itemName]
      });
    }
    
    inventory.set(userId, userInventory);
    
    res.json({ success: true, item: itemDefinitions[spawnedItem.itemName], distance: 30 });
  } catch (err) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取背包
app.get('/api/inventory', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ message: '未登录' });
  }
  
  try {
    const { userId } = JSON.parse(Buffer.from(authHeader.replace('Bearer ', ''), 'base64').toString());
    const userInventory = inventory.get(userId) || [];
    res.json(userInventory);
  } catch (err) {
    res.json([]);
  }
});

// 获取背包统计
app.get('/api/inventory/stats', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ message: '未登录' });
  }
  
  try {
    const { userId } = JSON.parse(Buffer.from(authHeader.replace('Bearer ', ''), 'base64').toString());
    const userInventory = inventory.get(userId) || [];
    
    const totalItems = userInventory.reduce((sum, item) => sum + item.quantity, 0);
    const uniqueItems = userInventory.length;
    const byRarity = {};
    
    userInventory.forEach(item => {
      const rarity = item.item?.rarity || 'common';
      byRarity[rarity] = (byRarity[rarity] || 0) + item.quantity;
    });
    
    res.json({ totalItems, uniqueItems, byRarity });
  } catch (err) {
    res.json({ totalItems: 0, uniqueItems: 0, byRarity: {} });
  }
});

app.get('/api/items', (req, res) => {
  res.json(Object.values(itemDefinitions));
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ API running on http://localhost:${PORT}/api`);
});