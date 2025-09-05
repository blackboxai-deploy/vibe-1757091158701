import { employeeQueries, dutyQueries } from './database';

// Police designations with counts
const DESIGNATIONS = [
  { title: 'Commissioner of Police', count: 1 },
  { title: 'Deputy Commissioner', count: 3 },
  { title: 'Assistant Commissioner', count: 8 },
  { title: 'Inspector', count: 25 },
  { title: 'Sub-Inspector', count: 45 },
  { title: 'Assistant Sub-Inspector', count: 60 },
  { title: 'Head Constable', count: 80 },
  { title: 'Constable', count: 200 },
  { title: 'Lady Constable', count: 60 },
  { title: 'Traffic Inspector', count: 15 },
  { title: 'Traffic Constable', count: 50 },
  { title: 'Armed Constable', count: 45 },
  { title: 'Driver', count: 8 }
];

// Common Indian names for police personnel
const NAMES = [
  'Rajesh Kumar Singh', 'Priya Sharma', 'Amit Patel', 'Sunita Devi', 'Vikram Singh Rathore',
  'Meera Gupta', 'Santosh Kumar', 'Ritu Verma', 'Manoj Kumar Yadav', 'Kavita Singh',
  'Deepak Thakur', 'Pooja Kumari', 'Ajay Kumar Mishra', 'Seema Rani', 'Ravi Shankar',
  'Anita Devi', 'Suresh Chand', 'Nirmala Kumari', 'Dinesh Kumar', 'Rekha Singh',
  'Ashok Kumar Gupta', 'Pushpa Devi', 'Ramesh Prasad', 'Shanti Kumari', 'Vinod Kumar',
  'Geeta Sharma', 'Mohanlal Verma', 'Sushma Singh', 'Naresh Kumar', 'Kamla Devi',
  'Brijesh Singh', 'Sudha Kumari', 'Jagdish Prasad', 'Urmila Devi', 'Pankaj Kumar',
  'Radha Rani', 'Subhash Chandra', 'Manju Devi', 'Anil Kumar Sharma', 'Savita Kumari',
  'Rakesh Kumar Tiwari', 'Bharti Singh', 'Mukesh Kumar', 'Sunanda Devi', 'Pramod Kumar',
  'Lata Devi', 'Hemant Kumar', 'Kiran Kumari', 'Sanjay Kumar Singh', 'Renu Sharma',
  'Govind Singh', 'Archana Devi', 'Ramesh Chandra', 'Sharda Kumari', 'Vijay Kumar',
  'Mamta Singh', 'Sunil Kumar Yadav', 'Asha Devi', 'Raghunath Singh', 'Neelam Kumari',
  'Bhupendra Singh', 'Sita Devi', 'Krishnanand Prasad', 'Veena Kumari', 'Mahesh Kumar',
  'Saraswati Devi', 'Shyam Sundar', 'Rajni Devi', 'Devendra Kumar', 'Poonam Kumari',
  'Girish Chandra', 'Indira Devi', 'Rajeev Kumar', 'Lalita Kumari', 'Nagendra Singh'
];

// Generate more names by combining first names and surnames
const FIRST_NAMES = [
  'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan', 'Shaurya',
  'Atharv', 'Advik', 'Pranav', 'Vedant', 'Abhinav', 'Harshit', 'Daksh', 'Divyansh', 'Yuvraj', 'Karthik',
  'Aadhya', 'Diya', 'Kavya', 'Ananya', 'Aanya', 'Navya', 'Myra', 'Sara', 'Priya', 'Jiya',
  'Shanaya', 'Ishika', 'Riya', 'Anika', 'Keya', 'Kiara', 'Saanvi', 'Ira', 'Pihu', 'Siya',
  'Rajesh', 'Suresh', 'Ramesh', 'Dinesh', 'Naresh', 'Mahesh', 'Ganesh', 'Lokesh', 'Hitesh', 'Jitesh',
  'Sunita', 'Geeta', 'Seema', 'Reeta', 'Meeta', 'Neeta', 'Sita', 'Rita', 'Lata', 'Kamala'
];

const SURNAMES = [
  'Singh', 'Kumar', 'Sharma', 'Gupta', 'Verma', 'Yadav', 'Patel', 'Mishra', 'Tiwari', 'Thakur',
  'Devi', 'Kumari', 'Prasad', 'Rani', 'Chandra', 'Rathore', 'Chauhan', 'Jain', 'Agarwal', 'Bansal',
  'Shukla', 'Pandey', 'Srivastava', 'Dubey', 'Tripathi', 'Chaturvedi', 'Dixit', 'Saxena', 'Rastogi', 'Khanna'
];

// Comprehensive duty types for police headquarters
const DUTY_TYPES = [
  // Guard Duties (54 types)
  { type: 'Main Gate Security', description: 'Primary entrance security and visitor control', permanent: true },
  { type: 'Back Gate Guard', description: 'Secondary entrance monitoring and access control', permanent: true },
  { type: 'Reception Desk', description: 'Front desk visitor assistance and information', permanent: true },
  { type: 'Control Room Guard', description: 'Control room security and monitoring', permanent: true },
  { type: 'Armory Security', description: 'Weapons storage area security', permanent: true },
  { type: 'Evidence Room Guard', description: 'Evidence storage security and access control', permanent: false },
  { type: 'Lock-up Security', description: 'Detention facility monitoring and security', permanent: true },
  { type: 'Vehicle Parking Security', description: 'Parking area security and vehicle monitoring', permanent: true },
  { type: 'Rooftop Security', description: 'Building perimeter and rooftop security', permanent: false },
  { type: 'Emergency Exit Guard', description: 'Emergency exit monitoring and security', permanent: true },
  { type: 'CCTV Monitoring', description: 'Security camera monitoring and surveillance', permanent: true },
  { type: 'Radio Room Security', description: 'Communication center security', permanent: true },
  { type: 'Generator Room Guard', description: 'Power backup facility security', permanent: false },
  { type: 'Water Tank Security', description: 'Water supply facility security', permanent: false },
  { type: 'Medical Room Guard', description: 'Medical facility security and assistance', permanent: false },
  { type: 'Training Hall Security', description: 'Training facility security during sessions', permanent: false },
  { type: 'Library Security', description: 'Police library security and assistance', permanent: false },
  { type: 'Canteen Security', description: 'Dining facility security and crowd control', permanent: true },
  { type: 'Store Room Guard', description: 'Supply storage security', permanent: false },
  { type: 'Records Room Security', description: 'Document storage security', permanent: true },
  { type: 'VIP Vehicle Security', description: 'Special vehicle security detail', permanent: false },
  { type: 'Building Perimeter Patrol', description: 'External building security patrol', permanent: true },
  { type: 'Internal Patrol', description: 'Internal building security rounds', permanent: true },
  { type: 'Night Duty Guard', description: 'Night shift security coverage', permanent: true },
  { type: 'Morning Duty Guard', description: 'Morning shift security coverage', permanent: true },
  { type: 'Evening Duty Guard', description: 'Evening shift security coverage', permanent: true },
  { type: 'Weekend Security', description: 'Weekend security coverage', permanent: false },
  { type: 'Holiday Duty', description: 'Holiday security coverage', permanent: false },
  { type: 'Special Event Security', description: 'Event-specific security detail', permanent: false },
  { type: 'Visitor Escort', description: 'VIP visitor escort and assistance', permanent: false },
  { type: 'Document Verification', description: 'Identity and document checking', permanent: true },
  { type: 'Metal Detector Operation', description: 'Security screening equipment operation', permanent: true },
  { type: 'Fire Safety Monitor', description: 'Fire safety and emergency preparedness', permanent: false },
  { type: 'Crowd Control', description: 'Public gathering and crowd management', permanent: false },
  { type: 'Traffic Control', description: 'Vehicle and pedestrian traffic management', permanent: true },
  { type: 'Emergency Response', description: 'First response to emergency situations', permanent: false },
  { type: 'Communications Duty', description: 'Radio and phone communications', permanent: true },
  { type: 'Patrol Vehicle Security', description: 'Police vehicle security and maintenance', permanent: true },
  { type: 'Bicycle Patrol', description: 'Bicycle patrol duty around premises', permanent: false },
  { type: 'K-9 Unit Support', description: 'Dog squad support and assistance', permanent: false },
  { type: 'Evidence Transport', description: 'Evidence transportation security', permanent: false },
  { type: 'Court Security', description: 'Court proceedings security detail', permanent: false },
  { type: 'Public Relations Desk', description: 'Public interaction and assistance', permanent: true },
  { type: 'Lost and Found', description: 'Lost property management', permanent: false },
  { type: 'Complaint Registration', description: 'Public complaint registration assistance', permanent: true },
  { type: 'Digital Security', description: 'IT infrastructure security monitoring', permanent: false },
  { type: 'Backup Power Monitor', description: 'Generator and power system monitoring', permanent: false },
  { type: 'Weather Watch', description: 'Weather monitoring for security planning', permanent: false },
  { type: 'Building Maintenance Security', description: 'Security during maintenance work', permanent: false },
  { type: 'Conference Room Security', description: 'Meeting room security during sessions', permanent: false },
  { type: 'Press Conference Security', description: 'Media event security coverage', permanent: false },
  { type: 'Special Investigation Support', description: 'Investigation team security support', permanent: false },
  { type: 'Transport Security', description: 'Personnel transport security', permanent: false },
  { type: 'Archive Security', description: 'Historical records security', permanent: false },

  // Bodyguard/VIP Protection Duties
  { type: 'Commissioner Protection', description: 'Police Commissioner personal security', permanent: true },
  { type: 'Deputy Commissioner Security', description: 'Deputy Commissioner protection detail', permanent: true },
  { type: 'VIP Escort Duty', description: 'High-ranking official protection', permanent: false },
  { type: 'Dignitary Protection', description: 'Visiting dignitaries security detail', permanent: false },
  { type: 'Judge Security', description: 'Judicial officer protection', permanent: false },
  { type: 'Witness Protection', description: 'Key witness security detail', permanent: false },
  { type: 'Political Figure Security', description: 'Political leader protection', permanent: false },
  { type: 'Celebrity Protection', description: 'Public figure security detail', permanent: false },
  { type: 'Business Leader Security', description: 'Corporate executive protection', permanent: false },
  { type: 'Family Protection Detail', description: 'VIP family member security', permanent: false },
  { type: 'Event VIP Security', description: 'Event-specific VIP protection', permanent: false },
  { type: 'Transport Security Detail', description: 'VIP transportation security', permanent: false },
  { type: 'Residence Security', description: 'VIP residence protection', permanent: false },
  { type: 'Medical Escort Security', description: 'VIP medical appointment security', permanent: false },
  { type: 'Airport Security Detail', description: 'VIP airport security coverage', permanent: false },

  // Administrative Duties
  { type: 'Desk Duty Officer', description: 'Administrative desk operations', permanent: true },
  { type: 'File Management', description: 'Document filing and organization', permanent: true },
  { type: 'Data Entry Clerk', description: 'Computer data entry and maintenance', permanent: true },
  { type: 'Phone Operator', description: 'Telephone operations and call routing', permanent: true },
  { type: 'Report Writing', description: 'Official report preparation', permanent: false },
  { type: 'Statistics Compilation', description: 'Data analysis and reporting', permanent: false },
  { type: 'Inventory Management', description: 'Equipment and supply tracking', permanent: false },
  { type: 'Vehicle Log Maintenance', description: 'Fleet management record keeping', permanent: true },
  { type: 'Personnel Records', description: 'Staff record management', permanent: true },
  { type: 'Budget Assistance', description: 'Financial record keeping support', permanent: false },
  { type: 'Training Coordination', description: 'Training program organization', permanent: false },
  { type: 'Schedule Management', description: 'Duty roster and schedule coordination', permanent: true },
  { type: 'Supply Requisition', description: 'Equipment and supply ordering', permanent: false },
  { type: 'Maintenance Requests', description: 'Building maintenance coordination', permanent: false },
  { type: 'Overtime Tracking', description: 'Personnel overtime record management', permanent: true },

  // Special Operations
  { type: 'Crime Scene Security', description: 'Crime scene protection and access control', permanent: false },
  { type: 'Investigation Support', description: 'Detective unit operational support', permanent: false },
  { type: 'Surveillance Operation', description: 'Undercover surveillance activities', permanent: false },
  { type: 'Raid Backup', description: 'Police raid operational support', permanent: false },
  { type: 'Drug Operation Support', description: 'Narcotics unit operational assistance', permanent: false },
  { type: 'Cyber Crime Support', description: 'Cyber crime unit assistance', permanent: false },
  { type: 'Forensic Unit Support', description: 'Forensic team operational support', permanent: false },
  { type: 'SWAT Team Backup', description: 'Special weapons team support', permanent: false },
  { type: 'Hostage Situation Support', description: 'Crisis situation support team', permanent: false },
  { type: 'Bomb Squad Support', description: 'Explosive device unit support', permanent: false },

  // Community Relations
  { type: 'Community Outreach', description: 'Public community engagement', permanent: false },
  { type: 'School Liaison', description: 'Educational institution coordination', permanent: false },
  { type: 'Public Event Coordination', description: 'Community event security planning', permanent: false },
  { type: 'Neighborhood Watch', description: 'Community security program support', permanent: false },
  { type: 'Youth Program Support', description: 'Youth engagement program assistance', permanent: false },

  // Leave Types
  { type: 'Casual Leave', description: 'Short-term personal leave', permanent: false },
  { type: 'Medical Leave', description: 'Health-related leave of absence', permanent: false },
  { type: 'Maternity Leave', description: 'Maternity leave for female officers', permanent: false },
  { type: 'Paternity Leave', description: 'Paternity leave for male officers', permanent: false },
  { type: 'Emergency Leave', description: 'Urgent personal emergency leave', permanent: false },
  { type: 'Annual Leave', description: 'Yearly vacation leave', permanent: false },
  { type: 'Study Leave', description: 'Educational purpose leave', permanent: false },
  { type: 'Compulsory Leave', description: 'Mandatory administrative leave', permanent: false },
  { type: 'Sick Leave', description: 'Illness-related leave', permanent: false },
  { type: 'Bereavement Leave', description: 'Grief leave for family loss', permanent: false },

  // Training and Development
  { type: 'Weapons Training', description: 'Firearms and weapons training session', permanent: false },
  { type: 'Physical Training', description: 'Fitness and physical conditioning', permanent: false },
  { type: 'Legal Training', description: 'Law and procedure training', permanent: false },
  { type: 'Technology Training', description: 'Equipment and technology training', permanent: false },
  { type: 'First Aid Training', description: 'Medical emergency response training', permanent: false },
  { type: 'Communication Training', description: 'Communication skills development', permanent: false },
  { type: 'Leadership Development', description: 'Leadership skills training', permanent: false },
  { type: 'Community Relations Training', description: 'Public interaction skills training', permanent: false },
  { type: 'Specialized Skills Training', description: 'Advanced skill development', permanent: false },
  { type: 'Refresher Course', description: 'Skills and knowledge refresher training', permanent: false },

  // Maintenance and Support
  { type: 'Equipment Maintenance', description: 'Police equipment servicing', permanent: false },
  { type: 'Vehicle Maintenance Support', description: 'Fleet maintenance assistance', permanent: false },
  { type: 'Building Cleaning Supervision', description: 'Facility cleanliness oversight', permanent: true },
  { type: 'Garden Maintenance', description: 'Premises landscaping maintenance', permanent: false },
  { type: 'IT Support Duty', description: 'Information technology support', permanent: false },
  { type: 'Equipment Testing', description: 'Equipment functionality testing', permanent: false },
  { type: 'Facility Inspection', description: 'Building and facility inspection', permanent: false },
  { type: 'Safety Equipment Check', description: 'Safety equipment verification', permanent: false },
  { type: 'Uniform Distribution', description: 'Personnel uniform management', permanent: false },
  { type: 'Supply Distribution', description: 'Equipment and supply distribution', permanent: false }
];

// Generate random mobile numbers
function generateMobileNumber(): string {
  const prefixes = ['98', '99', '97', '96', '95', '94', '93', '92', '91', '90'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const number = Math.floor(Math.random() * 90000000) + 10000000;
  return `${prefix}${number}`;
}

// Generate employee ID
function generateEmployeeId(index: number): string {
  return `EMP${(index + 1).toString().padStart(4, '0')}`;
}

// Generate random name
function generateName(): string {
  if (Math.random() < 0.3 && NAMES.length > 0) {
    // Use predefined names 30% of the time
    return NAMES[Math.floor(Math.random() * NAMES.length)];
  } else {
    // Generate new combination 70% of the time
    const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const surname = SURNAMES[Math.floor(Math.random() * SURNAMES.length)];
    return `${firstName} ${surname}`;
  }
}

// Insert sample employees
export function insertSampleEmployees(): void {
  try {
    let employeeIndex = 0;
    
    // Insert employees based on designation counts
    for (const designation of DESIGNATIONS) {
      for (let i = 0; i < designation.count; i++) {
        const employeeId = generateEmployeeId(employeeIndex);
        const name = generateName();
        const mobileNumber = generateMobileNumber();
        
        try {
          employeeQueries.insert.run(employeeId, name, designation.title, mobileNumber);
          employeeIndex++;
        } catch (error) {
          console.error(`Error inserting employee ${employeeId}:`, error);
        }
      }
    }
    
    console.log(`✅ Successfully inserted ${employeeIndex} sample employees`);
  } catch (error) {
    console.error('Error inserting sample employees:', error);
  }
}

// Insert sample duties
export function insertSampleDuties(): void {
  try {
    let insertCount = 0;
    
    for (const duty of DUTY_TYPES) {
      try {
        dutyQueries.insert.run(duty.type, duty.description, duty.permanent);
        insertCount++;
      } catch (error) {
        console.error(`Error inserting duty ${duty.type}:`, error);
      }
    }
    
    console.log(`✅ Successfully inserted ${insertCount} sample duties`);
  } catch (error) {
    console.error('Error inserting sample duties:', error);
  }
}

// Initialize all sample data
export function initializeSampleData(): void {
  console.log('🚀 Starting sample data initialization...');
  
  // Check if data already exists
  const existingEmployees = employeeQueries.getAll.all();
  const existingDuties = dutyQueries.getAll.all();
  
  if (existingEmployees.length === 0) {
    console.log('📥 Inserting sample employees...');
    insertSampleEmployees();
  } else {
    console.log(`ℹ️ Found ${existingEmployees.length} existing employees, skipping insertion`);
  }
  
  if (existingDuties.length === 0) {
    console.log('📥 Inserting sample duties...');
    insertSampleDuties();
  } else {
    console.log(`ℹ️ Found ${existingDuties.length} existing duties, skipping insertion`);
  }
  
  console.log('✅ Sample data initialization completed!');
  console.log(`📊 Database contains:`);
  console.log(`   - ${employeeQueries.getAll.all().length} employees`);
  console.log(`   - ${dutyQueries.getAll.all().length} duties`);
}