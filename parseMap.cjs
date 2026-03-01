const fs = require('fs');
const mapData = require('./map.cjs');

let out = `import { HTMLAttributes } from 'react'

export const WorldMapSVG = (props: HTMLAttributes<SVGSVGElement> & { activeCountries?: string[] }) => {
  const { activeCountries = ['US', 'GB', 'FR', 'MA'], ...restProps } = props;
  
  return (
    <svg viewBox="${mapData.viewBox}" {...restProps} xmlns="http://www.w3.org/2000/svg">
`;

mapData.locations.forEach(l => {
  const pathData = l.path;
  out += `      <path 
        id="${l.id}" 
        name="${l.name}" 
        d="${pathData}" 
        className={activeCountries.includes('${l.id}'.toUpperCase()) ? "fill-[#c2f34e] stroke-white stroke-[0.5] transition-colors duration-300 hover:brightness-95 cursor-pointer" : "fill-slate-200 stroke-white stroke-[0.5] transition-colors duration-300 hover:fill-slate-300 cursor-pointer"}
        strokeWidth="0.5"
      >
        <title>{'${l.name}'}</title>
      </path>\n`;
});

out += `    </svg>
  );
};
`;

fs.writeFileSync('src/components/ui/WorldMapSVG.tsx', out);
console.log('Successfully wrote src/components/ui/WorldMapSVG.tsx');
