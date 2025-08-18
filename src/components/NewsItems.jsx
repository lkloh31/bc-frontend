import React from "react";

export default function NewsItems({ articles, toggleFavorite, favorites }) {
  return (
    <>
      {articles.map((item, index) => {
        const isFav = favorites.some((fav) => fav.url === item.url);
        return (
          <div
            key={index}
            className="bg-black text-white rounded-md shadow-xl transform transition-all duration-300 hover:scale-105 cursor-pointer overflow-hidden"
          >
            {/* News Image */}
            <img
              src={
                item.urlToImage ||
                "https://via.placeholder.com/300x180?text=No+Image"
              }
              alt="News Image"
              className="h-[180px] w-full object-cover"
            />

            {/* Text Content below the image */}
            <div className="p-3">
              <h4 className="text-md mb-2">{item.title}</h4>
              <div className="flex items-center">
                <a
                  href={item.url}
                  className="text-gray-300 underline text-sm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Read More
                </a>
                <button
                  onClick={() => toggleFavorite(item)}
                  className={`ml-2 px-2 py-1 text-sm rounded cursor-pointer ${
                    isFav ? "bg-red-500" : "bg-gray-500"
                  }`}
                >
                  {isFav ? "Remove" : "Add"}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}
