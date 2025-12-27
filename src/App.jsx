@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Permanent+Marker&family=Pirata+One&display=swap');

:root {
  --flag-red: #CA222A;
  --old-lace: #FDF2E3;
  --flag-red-2: #BE292D;
  --tomato-jam: #C82B31;
  --almond-silk: #F8DACE;
}

body {
  background-color: var(--old-lace);
  color: var(--flag-red-2);
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

h1, h2, h3, h4, h5, h6 {
  font-family: 'Pirata One', cursive;
  letter-spacing: 1px;
  color: var(--flag-red);
}

.font-luffy {
  font-family: 'Permanent Marker', cursive;
}

html {
  scroll-behavior: smooth;
}

::-webkit-scrollbar {
  width: 10px;
}

::-webkit-scrollbar-track {
  background: var(--almond-silk);
}

::-webkit-scrollbar-thumb {
  background: var(--flag-red);
  border-radius: 5px;
  border: 2px solid var(--old-lace);
}

::-webkit-scrollbar-thumb:hover {
  background: var(--tomato-jam);
}
