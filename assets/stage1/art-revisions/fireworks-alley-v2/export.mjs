import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {PNG} from 'pngjs';
const dir=path.dirname(fileURLToPath(import.meta.url)),panels=[];
for(const letter of 'ABCD'){
 const clean=path.join(dir,`source_${letter}_clean.png`);
 const source=PNG.sync.read(fs.readFileSync(fs.existsSync(clean)?clean:path.join(dir,`source_${letter}.png`)));
 let top=source.height,bottom=-1;
 for(let y=0;y<source.height;y++)for(let x=0;x<source.width;x++)if(source.data[(y*source.width+x)*4+3]>=220){top=Math.min(top,y);bottom=Math.max(bottom,y);}
 const height=bottom-top+1,scale=Math.min(1280/source.width,384/height);
 const w=Math.round(source.width*scale),h=Math.round(height*scale),dx=Math.floor((1280-w)/2),dy=400-h;
 const p=new PNG({width:1280,height:400});
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const sx=Math.min(source.width-1,Math.floor(x/scale)),sy=top+Math.min(height-1,Math.floor(y/scale));
  const si=(sy*source.width+sx)*4;if(source.data[si+3]<220)continue;
  const di=((dy+y)*1280+dx+x)*4;source.data.copy(p.data,di,si,si+3);p.data[di+3]=255;
 }
 // Fill only tiny sampling gaps at foundations to register all bases at y399.
 for(let x=0;x<1280;x++)if(!p.data[(399*1280+x)*4+3]){
  let y=398;while(y>=0&&!p.data[(y*1280+x)*4+3])y--;
  if(y>=0)for(let yy=y+1;yy<400;yy++)p.data.copy(p.data,(yy*1280+x)*4,(y*1280+x)*4,(y*1280+x)*4+4);
 }
 panels.push({letter,p,sourceSize:[source.width,source.height],scale});
}
// Common neutral end-wall modules close all three A→B→C→D joins. Use only
// pixels of the generated bare brick end wall, leaving every central scene intact.
const wall=panels[0].p;
const strip=new PNG({width:48,height:400});PNG.bitblt(wall,strip,0,0,48,400,0,0);
for(const {p} of panels)for(let y=0;y<400;y++)for(let x=0;x<48;x++){
 const si=(y*48+x)*4;
 strip.data.copy(p.data,(y*1280+x)*4,si,si+4);
 strip.data.copy(p.data,(y*1280+1279-x)*4,si,si+4);
}
const reports=[];
const descriptions={A:'Screen 6: twilight alley entrance, picture-only firework posters and lit upstairs windows.',B:'Screen 7: purple brick wall with a zigzag metal fire escape; transparent sky without painted fireworks.',C:'Screen 8: night courtyard with laundry, striped canopy and mongoose mural; no painted fireworks.',D:'Screen 9: deepest-night descending rooftops, water tanks and string lights; no painted fireworks.'};
for(const {letter,p,sourceSize,scale} of panels){
 let empty=0,baselineGaps=0,transparent=0;
 for(let x=0;x<1280;x++){
  let found=false;for(let y=0;y<400;y++)if(p.data[(y*1280+x)*4+3])found=true;
  if(!found)empty++;if(!p.data[(399*1280+x)*4+3])baselineGaps++;
 }
 for(let i=3;i<p.data.length;i+=4)if(!p.data[i])transparent++;
 const file=`stage1_alley_${letter.toLowerCase()}.png`;
 fs.writeFileSync(path.join(dir,file),PNG.sync.write(p));
 reports.push({file,width:1280,height:400,baseline:399,screen:6+reports.length,description:descriptions[letter],sourceSize,uniformScale:scale,emptyColumns:empty,baselineGaps,transparentPixels:transparent,frameCount:1});
 if(empty||baselineGaps||!transparent)throw Error('Panel failed validation: '+letter);
}
const joins=[];
for(let i=0;i<3;i++){
 let mismatch=0;for(let y=0;y<400;y++)for(let k=0;k<4;k++)if(panels[i].p.data[(y*1280+1279)*4+k]!==panels[i+1].p.data[y*1280*4+k])mismatch++;
 joins.push({join:'ABCD'[i]+'→'+'ABCD'[i+1],mismatchChannels:mismatch});if(mismatch)throw Error('Join mismatch');
}
const preview=new PNG({width:1280,height:400});
for(let n=0;n<4;n++)for(let y=0;y<200;y++)for(let x=0;x<640;x++){
 const p=panels[n].p,si=((y*2)*1280+x*2)*4,di=((Math.floor(n/2)*200+y)*1280+n%2*640+x)*4;p.data.copy(preview.data,di,si,si+4);
}
fs.writeFileSync(path.join(dir,'preview.png'),PNG.sync.write(preview));
fs.writeFileSync(path.join(dir,'manifest.json'),JSON.stringify({generation:'built-in imagegen',order:['A','B','C','D'],files:reports,joins},null,2)+'\n');
console.log(JSON.stringify({files:reports,joins},null,2));
