import React from 'react';

const RTIPage = () => {
  const officers = [
    { id: 1, wing: "All matters relating to University College of Arts & Commerce", pio: "Principal, University College of Arts & Commerce", apio: "" },
    { id: 2, wing: "All matters relating to University College of Science & Technology", pio: "Principal, University College of Science & Technology", apio: "" },
    { id: 3, wing: "All matters relating to University College of Engineering", pio: "Principal, University College of Engineering", apio: "" },
    { id: 4, wing: "All matters relating to University College of Education", pio: "Principal, University College of Education", apio: "" },
    { id: 5, wing: "All matters relating to AKNU-MSN Campus, Kakinada", pio: "Principal, Aknu MSN Campus, Kakinada", apio: "" },
    { id: 6, wing: "All matters relating to AKNU Campus, Tadepalligudem", pio: "Principal, AKNU Campus, Tadepalligudem", apio: "" },
    { id: 7, wing: "All matters relating to Men's Hostel", pio: "Chief Warden, Men's Hostel", apio: "" },
    { id: 8, wing: "All matters relating to Women's Hostel", pio: "Chief Warden, Women's Hostel", apio: "" },
    { id: 9, wing: "All matters relating to Admissions", pio: "Director, Admissions", apio: "Asst. Director of Admissions" },
    { id: 10, wing: "All matters relating to Syllabi & other Academic Matters and CAS", pio: "Dean, College Development Council", apio: "Asst. Dean, Academic Affairs" },
    { id: 11, wing: "All matters relating to Affiliated colleges", pio: "Dean, College Development Council", apio: "Asst.Dean, CDC" },
    { id: 12, wing: "All matters relating to Examinations", pio: "Controller of Examinations", apio: "Superintendent, UG Examinations & Asst. Registrar, PG Examinations" },
    { id: 13, wing: "All matters relating to Establishment and other Service issues", pio: "Assistant Registrar", apio: "Superintendent Establishment section" },
    { id: 14, wing: "All matters relating to Finance and Accounts", pio: "Finance Officer", apio: "Superintendent, Accounts" },
    { id: 15, wing: "All matters relating to Transport, Guest House, Engineering Works, Maintenance, Construction of New Buildings etc.", pio: "University Engineer", apio: "" },
    { id: 16, wing: "All matters relating to NSS Cell", pio: "Co-Ordinator, NSS", apio: "" },
    { id: 17, wing: "All matters relating to Library", pio: "Asst. Librarian", apio: "" },
    { id: 18, wing: "All matters relating to Health Centre", pio: "Medical Officer", apio: "" },
    { id: 19, wing: "All matters relating to Physical Education", pio: "Asst. Director of Physical Education", apio: "" },
    { id: 20, wing: "All matters relating to R&D Cell", pio: "Dean, R&D Cell", apio: "" },
    { id: 21, wing: "All matters relating to IQAC", pio: "Director, IQAC", apio: "" },
    { id: 22, wing: "All matters relating to Nannaya Vani", pio: "PRO Nannaya Vani", apio: "" },
    { id: 23, wing: "All matters relating to SC/ST Cell", pio: "Coordinator, SC/ST Cell", apio: "" },
    { id: 24, wing: "All matters relating to Placement Cell", pio: "Placement Officer, Placement Cell", apio: "" },
  ];

  return (
    <div className="min-h-screen bg-emerald-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
         
          <div className="mt-6 p-4 bg-emerald-100 rounded-lg border border-emerald-200">
            <h3 className="text-lg font-semibold text-emerald-800">సమాచార హక్కు చట్టం - 2005</h3>
            <h3 className="text-lg font-semibold text-emerald-800 mt-2">Particulars of Information Officers</h3>
          </div>
        </div>

        {/* First Appellate Authority */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-emerald-200">
          <h3 className="text-xl font-bold text-emerald-800 mb-4">First Appellate Authority:</h3>
          <p className="text-gray-700 pl-4">
            The Registrar,<br />
            Adikavi Nannaya University,<br />
            Rajamahendravaram.
          </p>
        </div>

        {/* Officers Table */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden border border-emerald-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-emerald-200">
              <thead className="bg-emerald-700 text-white">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">S.No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Name of the Wing</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Public Information Officer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Asst. Public Information Officer</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-emerald-100">
                {officers.map((officer) => (
                  <tr key={officer.id} className={officer.id % 2 === 0 ? 'bg-emerald-50' : 'bg-white'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-emerald-900">{officer.id}</td>
                    <td className="px-6 py-4 whitespace-normal text-sm text-gray-700">{officer.wing}</td>
                    <td className="px-6 py-4 whitespace-normal text-sm text-gray-700">{officer.pio}</td>
                    <td className="px-6 py-4 whitespace-normal text-sm text-gray-700">{officer.apio}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

       
      </div>
    </div>
  );
};

export default RTIPage;