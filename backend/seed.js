const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Sale = require('./models/Sale');
require('dotenv').config();

// Sample pharmaceutical products
const products = [
  'Paracetamol 500mg',
  'Amoxicillin 250mg',
  'Ibuprofen 400mg',
  'Omeprazole 20mg',
  'Metformin 500mg',
  'Aspirin 100mg',
  'Cetirizine 10mg',
  'Vitamin D3 1000IU',
  'Azithromycin 500mg',
  'Losartan 50mg'
];

// Sample customer names
const customerNames = [
  'City Pharmacy',
  'HealthPlus Medical Store',
  'Green Cross Pharmacy',
  'MediCare Hospital',
  'Wellness Pharmacy',
  'Central Medical Store',
  'Life Care Clinic',
  'Apollo Pharmacy',
  'Max Healthcare',
  'Fortis Hospital'
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Sale.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const hashedPassword = await bcrypt.hash('password123', 10);

    const manager = await User.create({
      name: 'John Manager',
      email: 'manager@demo.com',
      password: hashedPassword,
      role: 'manager'
    });

    const salesRep1 = await User.create({
      name: 'Sarah Sales',
      email: 'sales@demo.com',
      password: hashedPassword,
      role: 'sales_representative'
    });

    const salesRep2 = await User.create({
      name: 'Mike Representative',
      email: 'mike@demo.com',
      password: hashedPassword,
      role: 'sales_representative'
    });

    console.log('Created users');

    // Create sales data
    const sales = [];
    const salesReps = [salesRep1, salesRep2];
    const regions = ['North', 'South', 'East', 'West', 'Central'];

    // Generate sales for the last 60 days
    for (let i = 0; i < 100; i++) {
      const daysAgo = Math.floor(Math.random() * 60);
      const saleDate = new Date();
      saleDate.setDate(saleDate.getDate() - daysAgo);

      const product = products[Math.floor(Math.random() * products.length)];
      const customer = customerNames[Math.floor(Math.random() * customerNames.length)];
      const quantity = Math.floor(Math.random() * 50) + 1;
      const price = (Math.random() * 100 + 10).toFixed(2);
      const rep = salesReps[Math.floor(Math.random() * salesReps.length)];
      const region = regions[Math.floor(Math.random() * regions.length)];

      sales.push({
        productName: product,
        quantity: quantity,
        price: parseFloat(price),
        totalAmount: quantity * parseFloat(price),
        dateOfSale: saleDate,
        customerInfo: {
          name: customer,
          email: `${customer.toLowerCase().replace(/\s+/g, '')}@example.com`,
          phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
          address: `${Math.floor(Math.random() * 999) + 1} Main Street, City`
        },
        salesRepresentative: rep._id,
        region: region,
        status: Math.random() > 0.1 ? 'completed' : (Math.random() > 0.5 ? 'pending' : 'cancelled'),
        notes: Math.random() > 0.7 ? 'Bulk order with discount applied' : ''
      });
    }

    await Sale.insertMany(sales);
    console.log(`Created ${sales.length} sales records`);

    console.log('\n=================================');
    console.log('Database seeded successfully!');
    console.log('=================================');
    console.log('\nDemo Accounts:');
    console.log('Manager: manager@demo.com / password123');
    console.log('Sales Rep 1: sales@demo.com / password123');
    console.log('Sales Rep 2: mike@demo.com / password123');
    console.log('=================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();