import React from 'react';

const inventoryItems = [
  {
    id: 1,
    name: 'Samsung Galaxy A15',
    category: 'Electronics',
    price: 'KES 18,000',
    stock: 120,
    image: 'https://via.placeholder.com/100',
  },
  {
    id: 2,
    name: 'HP Laptop 15"',
    category: 'Computers',
    price: 'KES 65,000',
    stock: 45,
    image: 'https://via.placeholder.com/100',
  },
  {
    id: 3,
    name: 'Electric Kettle',
    category: 'Home Appliances',
    price: 'KES 2,500',
    stock: 5,
    image: 'https://via.placeholder.com/100',
  },
];

const getStockStatus = (stock) => {
  if (stock > 50) return 'In Stock';
  if (stock > 0) return 'Low Stock';
  return 'Out of Stock';
};

const getStockColor = (stock) => {
  if (stock > 50) return 'text-green-600';
  if (stock > 0) return 'text-yellow-500';
  return 'text-red-500';
};

const ShopkeeperInventory = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
        My Inventory
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {inventoryItems.map((item) => (
          <div key={item.id} className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
            <img src={item.image} alt={item.name} className="w-full h-40 object-cover rounded mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{item.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{item.category}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Price: <span className="font-medium">{item.price}</span>
            </p>
            <p className={`mt-1 text-sm font-medium ${getStockColor(item.stock)}`}>
              {getStockStatus(item.stock)} ({item.stock} left)
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShopkeeperInventory;
