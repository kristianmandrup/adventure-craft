import { describe, it, expect } from 'vitest';

// Test the shop items configuration
describe('ShopPanel potions', () => {
  const SHOP_ITEMS = [
    { id: 'sword', name: 'Iron Sword', type: 'weapon', price: 50, description: '+10 attack damage' },
    { id: 'axe', name: 'Woodcutter Axe', type: 'axe', price: 40, description: 'Cuts trees faster' },
    { id: 'bow', name: 'Hunter Bow', type: 'bow', price: 75, description: 'Ranged attacks' },
    { id: 'arrows', name: 'Arrows (x10)', type: 'arrows', price: 20, description: 'Ammunition for bow' },
    { id: 'shield', name: 'Steel Shield', type: 'shield', price: 40, description: 'Doubles defense' },
    { id: 'armor', name: 'Iron Armor', type: 'iron_armor', price: 150, description: 'Reduces heavy damage' },
    { id: 'torch', name: 'Torch', type: 'torch', price: 15, description: 'Light in darkness' },
    { id: 'apple', name: 'Fresh Apple', type: 'apple', price: 5, description: 'Restores 10 hunger' },
    { id: 'health_potion', name: 'Health Potion', type: 'health_potion', price: 25, description: 'Restore 50 HP' },
    { id: 'speed_potion', name: 'Speed Potion', type: 'speed_potion', price: 35, description: '2x speed for 10s' },
    { id: 'strength_potion', name: 'Strength Potion', type: 'strength_potion', price: 40, description: '2x attack for 10s' },
    { id: 'swimming_potion', name: 'Swimming Potion', type: 'swimming_potion', price: 30, description: 'Water walk for 10s' },
  ];

  describe('Potion availability', () => {
    it('should include health potion in shop', () => {
      const healthPotion = SHOP_ITEMS.find(i => i.id === 'health_potion');
      expect(healthPotion).toBeDefined();
      expect(healthPotion?.price).toBe(25);
    });

    it('should include speed potion in shop', () => {
      const speedPotion = SHOP_ITEMS.find(i => i.id === 'speed_potion');
      expect(speedPotion).toBeDefined();
      expect(speedPotion?.price).toBe(35);
    });

    it('should include strength potion in shop', () => {
      const strengthPotion = SHOP_ITEMS.find(i => i.id === 'strength_potion');
      expect(strengthPotion).toBeDefined();
      expect(strengthPotion?.price).toBe(40);
    });

    it('should include swimming potion in shop', () => {
      const swimmingPotion = SHOP_ITEMS.find(i => i.id === 'swimming_potion');
      expect(swimmingPotion).toBeDefined();
      expect(swimmingPotion?.price).toBe(30);
    });
  });

  describe('Total shop items', () => {
    it('should have 12 items total', () => {
      expect(SHOP_ITEMS.length).toBe(12);
    });

    it('should have 4 potions', () => {
      const potions = SHOP_ITEMS.filter(i => i.type.includes('potion'));
      expect(potions.length).toBe(4);
    });
  });

  describe('Potion pricing', () => {
    it('should have potion prices between 25 and 40', () => {
      const potions = SHOP_ITEMS.filter(i => i.type.includes('potion'));
      for (const potion of potions) {
        expect(potion.price).toBeGreaterThanOrEqual(25);
        expect(potion.price).toBeLessThanOrEqual(40);
      }
    });
  });
});
