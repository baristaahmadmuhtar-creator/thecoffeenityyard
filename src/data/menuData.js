export const CATEGORIES = [
  "All",
  "Foods",
  "Desserts",
  "Beans",
  "Other",
  "test"
];

export const MENU_ITEMS = [
  {
    "id": "102",
    "name": "Burgers (Mini) - 6 pcs",
    "description": "Juicy premium beef patties, caramelized onions, and cheddar on soft brioche buns.",
    "originalPrice": 18,
    "price": 15,
    "category": "Foods",
    "image": "/images/burger.webp",
    "badge": "Min 1 Tray",
    "minQty": 1,
    "unit": "Tray",
    "mixLimit": null,
    "prepTime": 2,
    "allowDuplicate": true
  },
  {
    "id": "105",
    "name": "Pasta ",
    "description": "Large tray of al dente pasta. Choose from our signature sauces.",
    "originalPrice": 35,
    "price": 30,
    "category": "Foods",
    "image": "/images/pasta.webp",
    "badge": "Min 1 Tray",
    "minQty": 1,
    "unit": "Tray",
    "mixLimit": null,
    "prepTime": 3,
    "allowDuplicate": true,
    "options": {
      "choices": [
        "Classic Bolognese",
        "Creamy Carbonara",
        "Aglio Olio (Spicy)",
        "Tuna pasta"
      ],
      "title": "Select Option"
    }
  },
  {
    "id": "106",
    "name": "Cheese dip",
    "description": "Simple joy: warm bread + cheese dip",
    "originalPrice": 7,
    "price": 7,
    "category": "Foods",
    "image": "/images/cheesedip.webp",
    "badge": "Min 5 Sets",
    "minQty": 5,
    "unit": "Sets",
    "mixLimit": null,
    "prepTime": 3,
    "allowDuplicate": true
  },
  {
    "id": "201",
    "name": "Classic Waffle",
    "description": "Golden, fluffy Belgian waffles served fresh. Select your desired premium filling.",
    "originalPrice": 25,
    "price": 20,
    "category": "Desserts",
    "image": "/images/waffle.webp",
    "badge": "Min 1 Tray",
    "minQty": 1,
    "unit": "Tray",
    "mixLimit": null,
    "prepTime": 2,
    "allowDuplicate": true,
    "options": {
      "choices": [
        "Peanut Butter",
        "Chocolate",
        "Kaya",
        "Planta",
        "Mixed"
      ],
      "title": "Select Option"
    }
  },
  {
    "id": "202",
    "name": "Churros",
    "description": "Crispy fried dough pastry. Choose your dusting. (25pcs)",
    "originalPrice": 15,
    "price": 10,
    "category": "Desserts",
    "image": "/images/churros.webp",
    "badge": "25 Pcs / Tray",
    "minQty": 1,
    "unit": "Tray",
    "mixLimit": null,
    "prepTime": 2,
    "allowDuplicate": true,
    "options": {
      "choices": [
        "Original",
        "Cinnamon"
      ],
      "title": "Select Option"
    }
  },
  {
    "id": "301",
    "name": "Coffee Beans: NATSU BLEND",
    "description": "Taste Note：Dark Chocolate, Cane Sugar, Toasted Hazelnut.",
    "originalPrice": 55,
    "price": 42,
    "category": "Beans",
    "image": "/images/beans.webp",
    "badge": "Min 5 kg",
    "minQty": 5,
    "unit": "kg",
    "mixLimit": null,
    "prepTime": 1,
    "allowDuplicate": false
  },
  {
    "id": "FY02B",
    "name": "Sandwich - Egg",
    "description": "Classic creamy Egg Mayo sandwiches. (Approx. 20-24 pcs cut)",
    "originalPrice": 20,
    "price": 15,
    "category": "Foods",
    "image": "/images/sandwich3.webp",
    "badge": "",
    "minQty": 1,
    "unit": "Tray",
    "mixLimit": null,
    "prepTime": 1,
    "allowDuplicate": true
  },
  {
    "id": "FY02C",
    "name": "Sandwich - Tuna",
    "description": "Savory Tuna Mayo sandwiches with fresh lettuce. (Approx. 20-24 pcs cut)",
    "originalPrice": 20,
    "price": 15,
    "category": "Foods",
    "image": "/images/tuna1.webp",
    "badge": "Popular",
    "minQty": 1,
    "unit": "Tray",
    "mixLimit": null,
    "prepTime": 1,
    "allowDuplicate": true
  },
  {
    "id": "FY02D",
    "name": "Sandwich - Mixed egg tuna",
    "description": "Assortment, Egg Mayo, and Tuna Mayo sandwiches in one tray.",
    "originalPrice": 20,
    "price": 15,
    "category": "Foods",
    "image": "/images/sandwich.webp",
    "badge": "All-in-One",
    "minQty": 1,
    "unit": "Tray",
    "mixLimit": null,
    "prepTime": 1,
    "allowDuplicate": true
  },
  {
    "id": "FYO1A",
    "name": "3 Pizza Kayu api - 12 inch",
    "description": "3 Pans of 12-inch Wood-fired Pizzas. Crispy crust, rich flavor. Choose your favorite toppings.",
    "originalPrice": 54,
    "price": 45,
    "category": "Foods",
    "image": "/images/pizza.webp",
    "badge": "Best Seller",
    "minQty": 1,
    "unit": "Bundle",
    "mixLimit": null,
    "prepTime": 2,
    "allowDuplicate": true,
    "options": {
      "title": "Select Option",
      "choices": [
        "Pepperoni",
        "Honey Garlic",
        "Margherita",
        "Super Meat",
        "4 Cheese",
        "Tuna Mayo",
        "Salmon Mentai",
        "Burger Pizza",
        "Hawaiian",
        "Creamy Mushroom Chicken",
        "Mixed"
      ]
    }
  },
  {
    "id": "FYO1B",
    "name": "6 Pizza Kayu api - 12 inch",
    "description": "6 Pans of 12-inch Wood-fired Pizzas. The ultimate party pack.",
    "originalPrice": 108,
    "price": 80,
    "category": "Foods",
    "image": "/images/pizza.webp",
    "badge": "Must Try",
    "minQty": 1,
    "unit": "Bundle",
    "mixLimit": null,
    "prepTime": 3,
    "allowDuplicate": true,
    "options": {
      "choices": [
        "Pepperoni",
        "Honey Garlic",
        "Margherita",
        "Super Meat",
        "4 Cheese",
        "Tuna Mayo",
        "Salmon Mentai",
        "Burger Pizza",
        "Hawaiian",
        "Creamy Mushroom Chicken",
        "Mixed"
      ],
      "title": "Select Option"
    }
  },
  {
    "id": "FYO4A",
    "name": "Dendeng Sambal Hijau w rice - 6 Bowl",
    "description": "6 Bowls of signature Dendeng Sambal Hijau served with fragrant rice. Perfect for small groups.",
    "originalPrice": 30,
    "price": 25,
    "category": "Foods",
    "image": "/images/dengdeng1.webp",
    "badge": "Favorit",
    "minQty": 1,
    "unit": "Bundle",
    "mixLimit": null,
    "prepTime": 2,
    "allowDuplicate": false
  },
  {
    "id": "FYO4B",
    "name": "Dendeng Sambal Hijau w Rice - 12 Bowl",
    "description": "12 Bowls of signature Dendeng Sambal Hijau served with fragrant rice. Great value for larger gatherings.",
    "originalPrice": 60,
    "price": 50,
    "category": "Foods",
    "image": "/images/dengdeng.webp",
    "badge": "Party Bundle",
    "minQty": 1,
    "unit": "Bundle",
    "mixLimit": null,
    "prepTime": 2,
    "allowDuplicate": false
  },
  {
    "id": "ITEM-1765801587",
    "name": "Coffee in a Can",
    "description": "House Latte Served in a can. Best enjoyed within 7 days when kept chilled.",
    "originalPrice": 3.5,
    "price": 3,
    "category": "Other",
    "image": "/images/coffeecan.webp",
    "badge": "Min 10 Can",
    "minQty": 10,
    "unit": "Can",
    "mixLimit": 1,
    "prepTime": 2,
    "allowDuplicate": false
  },
  {
    "id": "ITEM-1766943580",
    "name": "Family Feast Bundle",
    "description": "untuk 10 orang",
    "originalPrice": 200,
    "price": 100,
    "category": "Foods",
    "image": "/images/makanan1.jpeg",
    "badge": "must try",
    "minQty": 1,
    "unit": "Bundle",
    "mixLimit": 2,
    "prepTime": 24,
    "allowDuplicate": true,
    "options": {
      "choices": [
        "peperoni"
      ],
      "title": "Select Option"
    }
  },
  {
    "id": "ITEM-1766945054",
    "name": "test package",
    "description": "untuk 10 orang",
    "originalPrice": 100,
    "price": 50,
    "category": "Foods",
    "image": "/images/makanan2.jpeg",
    "badge": "worth it",
    "minQty": 1,
    "unit": "Bundle",
    "mixLimit": 5,
    "prepTime": 24,
    "allowDuplicate": true,
    "options": {
      "title": "Select Option",
      "choices": [
        "basreng",
        "molen",
        "mie"
      ]
    }
  }
];