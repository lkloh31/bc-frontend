import { createContext, useContext, useState } from "react";

import { useAuth } from "../auth/AuthContext";

export const API = "http://localhost:3000";

const ApiContext = createContext();

export function ApiProvider({ children }) {
  const { token } = useAuth();

  /**
   * Makes an API call and parses the response as JSON if possible.
   * Throws an error if anything goes wrong.
   */
  const request = async (resource, options = {}) => {
    // Create headers object
    const headers = {
      "Content-Type": "application/json",
      ...options.headers, // Allow overriding headers
    };

    // Only add Authorization header if token exists
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    console.log("Making request to:", API + resource);
    console.log("With headers:", headers);
    console.log("With options:", options);

    try {
      const response = await fetch(API + resource, {
        ...options,
        headers,
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      const isJson = /json/.test(response.headers.get("Content-Type"));
      const result = isJson ? await response.json() : await response.text();

      console.log("Response result:", result);

      if (!response.ok) {
        throw new Error(result?.message || result || "Something went wrong :(");
      }

      return result;
    } catch (error) {
      console.error("Request failed:", error);
      throw error;
    }
  };

  const [tags, setTags] = useState({});

  /** Stores the provided query function for a given tag */
  const provideTag = (tag, query) => {
    setTags({ ...tags, [tag]: query });
  };

  /** Calls all query functions associated with the given tags */
  const invalidateTags = (tagsToInvalidate) => {
    tagsToInvalidate.forEach((tag) => {
      const query = tags[tag];
      if (query) query();
    });
  };

  const value = { request, provideTag, invalidateTags };
  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
}

export function useApi() {
  const context = useContext(ApiContext);
  if (!context) throw Error("useApi must be used within ApiProvider");
  return context;
}
