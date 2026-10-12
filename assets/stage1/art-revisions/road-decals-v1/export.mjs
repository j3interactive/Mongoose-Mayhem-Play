import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {PNG} from 'pngjs';
const dir=path.dirname(fileURLToPath(import.meta.url));
const specs=JSON.parse(fs.readFileSync(path.join(dir,'sources.json')));
const files=[];
fs.mkdirSync(path.join(dir,'sources'),{recursive:true});
for(const s of specs){
 const bytes=fs.readFileSync(s.sourcePath);fs.writeFileSync(path.join(dir,'sources',s.key+'.png'),bytes);
 const src=PNG.sync.read(bytes);let left=src.width,right=-1,top=src.height,bottom=-1;
 for(let y=0;y<src.height;y++)for(let x=0;x<src.width;x++)if(src.data[(y*src.width+x)*4+3]>=220){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
 if(right<left)throw Error('Empty source '+s.key);
 const w=right-left+1,h=bottom-top+1,scale=Math.min((s.width-4)/w,(s.height-4)/h);
 const dw=Math.max(1,Math.round(w*scale)),dh=Math.max(1,Math.round(h*scale));
 const dx=Math.floor((s.width-dw)/2),dy=Math.floor((s.height-dh)/2),out=new PNG({width:s.width,height:s.height});
 for(let y=0;y<dh;y++)for(let x=0;x<dw;x++){
  const sx=left+Math.min(w-1,Math.floor(x/scale)),sy=top+Math.min(h-1,Math.floor(y/scale));
  const si=(sy*src.width+sx)*4;if(src.data[si+3]<220)continue;
  const di=((dy+y)*s.width+dx+x)*4;src.data.copy(out.data,di,si,si+3);out.data[di+3]=255;
 }
 const file='stage1_decal_'+s.key+'.png';fs.writeFileSync(path.join(dir,file),PNG.sync.write(out));
 let opaque=0,edgePixels=0;
 for(let y=0;y<s.height;y++)for(let x=0;x<s.width;x++)if(out.data[(y*s.width+x)*4+3]){opaque++;if(x===0||y===0||x===s.width-1||y===s.height-1)edgePixels++;}
 if(!opaque||opaque===s.width*s.height||edgePixels)throw Error('Decal alpha/clipping check failed '+file);
 if(s.key==='fountain_wet_ring'&&out.data[(Math.floor(s.height/2)*s.width+Math.floor(s.width/2))*4+3])throw Error('Wet ring center must be transparent');
 files.push({file,width:s.width,height:s.height,frameCount:1,description:s.description,alphaValues:[0,255],opaquePixels:opaque,edgePixels,sourceBounds:{left,top,right,bottom},export:'proportional nearest-neighbor sampling'});
}
const sheet=new PNG({width:704,height:600}),regions=[];
for(let i=0;i<files.length;i++){
 const f=files[i],png=PNG.sync.read(fs.readFileSync(path.join(dir,f.file)));
 const x=i%2*352+Math.floor((352-f.width)/2),y=Math.floor(i/2)*120+Math.floor((120-f.height)/2);
 PNG.bitblt(png,sheet,0,0,f.width,f.height,x,y);
 regions.push({file:f.file,x,y,width:f.width,height:f.height});
}
fs.writeFileSync(path.join(dir,'stage1_road_decals_sheet.png'),PNG.sync.write(sheet));
fs.writeFileSync(path.join(dir,'manifest.json'),JSON.stringify({stage:'Festival Night',type:'Flat road decals',generator:'built-in imagegen',files,atlas:{file:'stage1_road_decals_sheet.png',width:704,height:600,regions}},null,2)+'\n');
console.log('Exported and checked '+files.length+' exact-size transparent decals.');
