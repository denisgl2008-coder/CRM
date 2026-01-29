import axios from 'axios';

const API_URL = 'http://localhost:3000/api/v1';

async function verify() {
    try {
        console.log('1. Registering new user...');
        const email = `test.user.${Date.now()}@example.com`;
        const password = 'Password123!';
        const workspaceName = `Workspace_${Date.now()}`;

        const registerRes = await axios.post(`${API_URL}/auth/register`, {
            email,
            password,
            workspaceName,
        });
        console.log('✅ Registration successful:', registerRes.data.user.email);

        console.log('\n2. Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email,
            password,
        });
        console.log('✅ Login successful. Token received.');
        const token = loginRes.data.token;

        console.log('\n3. Accessing Protected Route (Leads)...');
        const leadRes = await axios.post(
            `${API_URL}/leads`,
            { name: 'Big Enterprise Deal', budget: 50000, status: 'active' },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('✅ Lead created:', leadRes.data.name);

        console.log('\n4. Fetching Leads...');
        const leadsRes = await axios.get(`${API_URL}/leads`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        console.log('✅ Leads fetched:', leadsRes.data.length, 'leads found.');
        console.log('Lead Details:', leadsRes.data[0]);

        console.log('\n5. Creating a Contact...');
        const contactRes = await axios.post(
            `${API_URL}/contacts`,
            { firstName: 'Juan', lastName: 'Perez', email: `juan.${Date.now()}@test.com`, position: 'Manager' },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('✅ Contact created:', contactRes.data.firstName);

        console.log('\n6. Fetching Contacts...');
        const contactsRes = await axios.get(`${API_URL}/contacts`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        console.log('✅ Contacts fetched:', contactsRes.data.length, 'contacts found.');

        console.log('\n7. Creating a Company...');
        const companyRes = await axios.post(
            `${API_URL}/companies`,
            { name: 'Tech Corp', industry: 'Software', email: 'info@techcorp.com' },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('✅ Company created:', companyRes.data.name);

        console.log('\n8. Fetching Companies...');
        const companiesRes = await axios.get(`${API_URL}/companies`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        console.log('✅ Companies fetched:', companiesRes.data.length, 'companies found.');

        console.log('\n🎉 ALL MODULES VERIFIED SUCCESSFULLY');
    } catch (error: any) {
        console.error('❌ Verification Failed:', error.response?.data || error.message);
    }
}

verify();
