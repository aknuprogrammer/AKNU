import axios from "axios";
import { BASE_URL } from "../../config/urls";

export default async function infoAPI({ resourceName, action, dbid, n, doc }) {
  const actions = ["create", "update", "delete", "read_recent", "read_all"];
  const resourceNames = [
    "results",
    "circular",
    "jobs",
    "tenders",
    "exam_applications",
    "exam_jumblingcenters",
    "exam_notifications",
    "exam_timetable",
    "curcular_proceedings",
    "all_circulars",
    "cdc_circulars",
    "doa_circulars",
    "academic_circulars",
    "circulars_applications",
    "academic_calendar",
    "gos"
  ];

  if (!actions.includes(action) || !resourceNames.includes(resourceName))
    return { error: "Invalid action or resourceName" };

  const BASE_PATH = BASE_URL + "/info/" + resourceName;

  try {
    let response;
    switch (action) {
      case "create":
        if (!doc) return { error: "Missing doc for create" };
        const formData = new FormData();
        formData.append("title", doc.title);
        formData.append("date", doc.date);
        if (doc.note) formData.append("note", doc.note);
        formData.append("file", doc.file);
        response = await axios.post(BASE_PATH, formData);
        break;
      case "update":
        if (!dbid || !doc) return { error: "Missing dbid or doc for update" };
        const formData2 = new FormData();
        formData2.append("title", doc.title);
        formData2.append("date", doc.date);
        if (doc.note) formData2.append("note", doc.note);
        if (doc.file) formData2.append("file", doc.file);
        response = await axios.patch(`${BASE_PATH}/${dbid}`, formData2);
        break;
      case "delete":
        if (!dbid) return { error: "Missing dbid for delete" };
        response = await axios.delete(`${BASE_PATH}/${dbid}`);
        break;
      case "read_recent":
        if (!n) return { error: "Missing n for read_recent" };
        response = await axios.get(`${BASE_PATH}/recent/${n}`);
        break;
      case "read_all":
        response = await axios.get(BASE_PATH + "/all");
        break;
      default:
        return { error: "Unknown action" };
    }
    return {
      status: response.status,
      success: 200 <= response.status && response.status <= 299,
      data: response.data,
    };
  } catch (error) {
    return {
      error: error?.response?.data || error?.message,
      status: error?.response?.status || 500,
      success:
        200 <= (error?.response?.status || 500) &&
        (error.response?.status || 500) <= 299,
    };
  }
}
