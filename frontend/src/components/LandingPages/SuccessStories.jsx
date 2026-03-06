import React from "react";

export default function SuccessStories() {

  const stories = [
    {
      city: "INDORE",
      title: "Achieving #1 Cleanest City Status with Community Reporting",
      stat: "5,000+ citizen reports resolved",
      desc: "Residents reported waste issues and illegal dumping which helped Indore maintain India's cleanest city ranking.",
      image: "https://images.unsplash.com/photo-1604187351574-c75ca79f5807?auto=format&fit=crop&w=1200&q=80"
    },
    {
      city: "PUNE",
      title: "Fixing 500+ Potholes in a Single Monsoon Week",
      stat: "72% faster response time",
      desc: "Citizens reported road damage during monsoon season allowing authorities to repair potholes quickly.",
      image: "https://images.unsplash.com/photo-1593950315186-76a92975b60c?auto=format&fit=crop&w=1200&q=80"
    },
    {
      city: "CHANDIGARH",
      title: "Smart Street Lighting: A Brighter, Safer City",
      stat: "1200+ lights repaired",
      desc: "Reports of broken street lights helped improve night safety across residential areas.",
      image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-900 transition-colors duration-300">

      <main className="flex-grow py-20 px-6 max-w-7xl mx-auto w-full">

        <div className="text-center mb-20">
          <span className="text-green-600 dark:text-green-400 font-semibold tracking-wide uppercase text-sm">
            SUCCESS STORIES
          </span>

          <h1 className="text-4xl md:text-5xl font-bold mt-2 text-slate-900 dark:text-white">
            Real Impact from Citizen Reports
          </h1>
        </div>

        <div className="grid md:grid-cols-3 gap-8">

          {stories.map((story, i) => (
            <div key={i} className="group cursor-pointer">

              <div className="h-64 rounded-2xl mb-6 overflow-hidden relative shadow-lg">

                <img
                  src={story.image}
                  alt={story.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                <div className="absolute top-4 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  {story.city}
                </div>

              </div>

              <h3 className="text-2xl font-bold mb-2 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors text-slate-900 dark:text-white">
                {story.title}
              </h3>

              <div className="text-blue-600 dark:text-blue-400 font-bold text-lg mb-3">
                {story.stat}
              </div>

              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {story.desc}
              </p>

            </div>
          ))}

        </div>

      </main>

    </div>
  );
}