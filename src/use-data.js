import Papa from "papaparse";
import React, { useState, useEffect, useMemo, useContext } from "react";

export const useData = () => {
  const [data, setData] = useState(null);
  const [fields, setFields] = useState(null);

  useEffect(() => {
    const url = "./relations.csv";
    Papa.parse(url, {
      download: true,
      header: true,
      complete: function (results) {
        setData(
          results.data?.map((o) => ({
            ...o,
            character1: o.character1?.trim(),
            character2: o.character2?.trim(),
            relation: o.relation?.trim() === "-" ? "" : o.relation?.split(" ")[0],
            relationLabel:
              o.relation?.trim() === "-" ? "" : o.relation?.split("-")[1]?.trim(),
          })) ?? null
        );
        setFields(results.meta.fields);
      },
    });
  }, []);

  return {
    data,
    fields,
  };
};
