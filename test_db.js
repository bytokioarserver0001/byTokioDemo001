const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://iipemcsgdsankicwrmlv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpcGVtY3NnZHNhbmtpY3dybWx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3NDAwNzUsImV4cCI6MjA5MjMxNjA3NX0.SHGUu7WRNR4GxclT-WDn7K1v5LAwxB3E-nNKcRtAwVA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkBookings() {
  const { data, error } = await supabase.from('bookings').select('*');
  if (error) {
    console.error('Error:', error);
    return;
  }
  console.log('Bookings in DB:', JSON.stringify(data, null, 2));
}

checkBookings();
