export default function Section_FeeStructure() {
  return (
    <section className="container-standard py-6">
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border border-gray-300 text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="border px-4 py-2 text-left">PARTICULARS</th>
              <th className="border px-4 py-2 text-center">
                1<sup>st</sup> Year
                <br />
                <span className="text-xs text-gray-500">Per year (Rs)</span>
              </th>
              <th className="border px-4 py-2 text-center">
                2<sup>nd</sup> Year
                <br />
                <span className="text-xs text-gray-500">Per year (Rs)</span>
              </th>
              <th className="border px-4 py-2 text-center">
                3<sup>rd</sup> Year
                <br />
                <span className="text-xs text-gray-500">Per year (Rs)</span>
              </th>
              <th className="border px-4 py-2 text-center">
                4<sup>th</sup> Year
                <br />
                <span className="text-xs text-gray-500">Per year (Rs)</span>
              </th>
            </tr>
          </thead>
          <tbody className="text-gray-800">
            <tr className="hover:bg-gray-50">
              <td className="border px-4 py-2">Hostel development fund</td>
              <td className="border px-4 py-2 text-center">1000</td>
              <td className="border px-4 py-2 text-center">1000</td>
              <td className="border px-4 py-2 text-center">1000</td>
              <td className="border px-4 py-2 text-center">1000</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="border px-4 py-2">
                Room rent
                <br />
                <span className="text-xs text-gray-500">
                  (per month @ 100 for 11 months)
                </span>
              </td>
              <td className="border px-4 py-2 text-center">1100</td>
              <td className="border px-4 py-2 text-center">1100</td>
              <td className="border px-4 py-2 text-center">1100</td>
              <td className="border px-4 py-2 text-center">1100</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="border px-4 py-2">
                Caution deposit{" "}
                <span className="text-xs text-gray-500">
                  (Refundable, at admission)
                </span>
              </td>
              <td className="border px-4 py-2 text-center">2000</td>
              <td className="border px-4 py-2 text-center">--</td>
              <td className="border px-4 py-2 text-center">--</td>
              <td className="border px-4 py-2 text-center">--</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="border px-4 py-2">Admission fee</td>
              <td className="border px-4 py-2 text-center">500</td>
              <td className="border px-4 py-2 text-center">--</td>
              <td className="border px-4 py-2 text-center">--</td>
              <td className="border px-4 py-2 text-center">--</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="border px-4 py-2">Miscellaneous</td>
              <td className="border px-4 py-2 text-center">1000</td>
              <td className="border px-4 py-2 text-center">1000</td>
              <td className="border px-4 py-2 text-center">1000</td>
              <td className="border px-4 py-2 text-center">1000</td>
            </tr>
            <tr className="font-semibold bg-gray-50">
              <td className="border px-4 py-2">*Total</td>
              <td className="border px-4 py-2 text-center">5600</td>
              <td className="border px-4 py-2 text-center">3100</td>
              <td className="border px-4 py-2 text-center">3100</td>
              <td className="border px-4 py-2 text-center">3100</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
