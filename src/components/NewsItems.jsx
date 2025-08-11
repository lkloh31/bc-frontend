import React from "react";

export default function NewsItems({ articles, toggleFavourite, favourites }) {
  return (
    <>
      {articles.map((item, index) => {
        const isFav = favourites.some((fav) => fav.url === item.url);
        return (
          <div
            key={index}
            className="bg-black text-white rounded-md shadow-xl relative transform transition-all duration-300 hover:scale-105 cursor-pointer"
          >
            <img
              src={
                item.urltoimage ||
                "https://via.placeholder.com/300x180?text=No+Image"
              }
              alt="News Image"
              className="h-[180px] w-full opacity-[0.4]"
            />
            <div className="absolute bottom-1 p-2">
              <h4>{item.title}</h4>
              <a
                href={item.url}
                className="text-gray-400 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Read More
              </a>
              <button
                onClick={() => toggleFavourite(item)}
                className={`ml-2 px-2 py-1 text-sm rounded ${
                  isFav ? "bg-red-500" : "bg-green-500"
                }`}
              >
                {isFav ? "Remove" : "Add"}
              </button>
            </div>
          </div>
        );
      })}
    </>
  );
}
