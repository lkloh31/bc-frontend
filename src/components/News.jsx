import React, { useState, useEffect } from "react";
import axios from "axios";
import NewsItems from "./NewsItems";
import InfiniteScroll from "react-infinite-scroll-component";
import { FaSearch } from "react-icons/fa";
import "../styles/pages/news.css";

export default function News() {
  const options = [
    "Business",
    "Technology",
    "Sports",
    "Innovation",
    "Arts",
    "Travel",
    "Earth",
  ];

  const [search, setSearch] = useState("latest"); // default search term
  const [page, setPage] = useState(1);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async (searchTerm, pageNum) => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:3000/daily/news", {
        params: { q: searchTerm || "latest", page: pageNum },
      });
      if (pageNum === 1) {
        setArticles(res.data);
      } else {
        setArticles((prev) => [...prev, ...res.data]);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (search) {
      fetchData(search, page);
    }
  }, [search, page]);

  const searchNews = (term) => {
    const trimmedTerm = term.trim();
    setArticles([]);
    setPage(1);
    setSearch(trimmedTerm === "" ? "latest" : trimmedTerm);
  };

  const fetchNews = () => {
    setPage((prev) => prev + 1);
  };

  return (
    <div className="news-container h-100vh w-full">
      <nav className="flex justify-between p-5 bg-black">
        <h4 className="text-gray-400 text-2xl font-bold">News</h4>
        <div className="bg-white flex justify-center items-center">
          <input
            type="text"
            value={
              options.some((opt) => opt.toLowerCase() === search.toLowerCase())
                ? ""
                : search === "latest"
                ? ""
                : search
            }
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                searchNews(e.target.value);
              }
            }}
            placeholder="Search news..."
            className="w-[300px] h-[30px] bg-white p-2 outline-none"
          />
          <FaSearch
            onClick={() => searchNews(search)}
            className="text-md cursor-pointer"
          />
        </div>
      </nav>

      <div className="w-[1200px] mx-auto mt-[40px]">
        <div className="flex justify-center items-center border-b-1 pb-[10px]">
          {options.map((item) => (
            <div
              key={item}
              className={`mx-[20px] p-2 cursor-pointer rounded-md ${
                search.toLowerCase() === item.toLowerCase()
                  ? "bg-gray-700 text-white"
                  : "bg-black text-gray-300"
              }`}
              onClick={() => searchNews(item)}
            >
              {item}
            </div>
          ))}
        </div>

        <InfiniteScroll
          dataLength={articles.length}
          next={fetchNews}
          hasMore={true}
          loader={<h4>Loading...</h4>}
          endMessage={
            <p style={{ textAlign: "center" }}>
              <b>No more articles.</b>
            </p>
          }
          scrollThreshold={0.9}
        >
          <div className="grid grid-cols-3 gap-5 mt-[40px]">
            <NewsItems articles={articles} />
          </div>
        </InfiniteScroll>

        {!loading && articles.length === 0 && (
          <p className="text-center mt-10 text-gray-500">No articles found</p>
        )}
      </div>
    </div>
  );
}
