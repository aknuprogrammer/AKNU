import { useState, useEffect } from "react";

export function useFolderFiles(url) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(url)
      .then((res) => res.json())
      .then((data) => setFiles(data))
      .catch((err) => console.error("Error loading files:", err))
      .finally(() => setLoading(false));
  }, [url]);

  return { files, loading };
}
