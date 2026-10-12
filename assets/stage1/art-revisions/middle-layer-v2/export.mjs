import fs from 'node:fs';
import {PNG} from 'pngjs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const dir=path.dirname(fileURLToPath(import.meta.url));
const src=PNG.sync.read(fs.readFileSync(path.join(dir,'source-dense-atlas.png')));
const out=new PNG({width:5120,height:720});
const names=['Pink house','Broad banyan','Teal cafe','Three-story house','Temple gate','Orange shop','Bent banyan and bench','Lilac house and water tank'];
// Pack the two authored panorama rows into eight adjoining 640px modules.
// Normalize their silhouette extents into y120..399 with nearest sampling;
// road-reserve rows remain untouched, fully transparent.
for(let n=0;n<8;n++){
 const left=Math.floor(n%4*src.width/4),right=Math.floor((n%4+1)*src.width/4);
 const top=n<4?53:449,bottom=n<4?422:767;
 for(let y=120;y<400;y++)for(let x=0;x<640;x++){
  const sx=left+Math.min(right-left-1,Math.floor(x*(right-left)/640));
  const sy=top+Math.min(bottom-top-1,Math.floor((y-120)*(bottom-top)/280));
  const si=(sy*src.width+sx)*4;if(src.data[si+3]<220)continue;
  const di=(y*5120+n*640+x)*4;src.data.copy(out.data,di,si,si+3);out.data[di+3]=255;
 }
}
// Close any single transparent source-border column introduced by atlas cuts.
for(let x=1;x<5120;x++){
 let last=-1;for(let y=399;y>=120;y--)if(out.data[(y*5120+x)*4+3]){last=y;break;}
 if(last<0){for(let y=120;y<400;y++)out.data.copy(out.data,(y*5120+x)*4,(y*5120+x-1)*4,(y*5120+x-1)*4+4);}
}
// Register the visible foundations on the exact common baseline.
for(let x=0;x<5120;x++)if(!out.data[(399*5120+x)*4+3]){
 let y=398;while(y>=120&&!out.data[(y*5120+x)*4+3])y--;
 if(y>=120)for(let yy=y+1;yy<400;yy++)out.data.copy(out.data,(yy*5120+x)*4,(y*5120+x)*4,(y*5120+x)*4+4);
}
// A tiny mirrored endcap closes the cyclic architectural boundary. This reuses
// the existing first edge's pixels, without generating any additional scenery.
for(let y=0;y<720;y++)for(let x=0;x<16;x++){
 const si=(y*5120+x)*4,di=(y*5120+5119-x)*4;out.data.copy(out.data,di,si,si+4);
}
fs.writeFileSync(path.join(dir,'stage1_mid_v2.png'),PNG.sync.write(out));
const preview=new PNG({width:2560,height:360});
for(let y=0;y<360;y++)for(let x=0;x<2560;x++)out.data.copy(preview.data,(y*2560+x)*4,(y*2*5120+x*2)*4,(y*2*5120+x*2)*4+4);
fs.writeFileSync(path.join(dir,'preview.png'),PNG.sync.write(preview));
let below=0,empty=0,seam=0,min=720,max=-1;
for(let x=0;x<5120;x++){
 let found=false;for(let y=0;y<720;y++)if(out.data[(y*5120+x)*4+3]){found=true;min=Math.min(min,y);max=Math.max(max,y);if(y>=400)below++;}
 if(!found)empty++;
}
for(let y=0;y<720;y++)for(let k=0;k<4;k++)if(out.data[y*5120*4+k]!==out.data[(y*5120+5119)*4+k])seam++;
const report={width:5120,height:720,baseline:400,opaqueBoundsY:[min,max],pixelsAtOrBelow400:below,emptyColumns:empty,wrapMismatchChannels:seam,alphaValues:[0,255],groups:names,generation:'built-in imagegen',export:'nearest-neighbor panorama-row packing with y400 registration and mirrored 16px wrap endcap'};
fs.writeFileSync(path.join(dir,'validation.json'),JSON.stringify(report,null,2)+'\n');
if(below||empty||seam)throw Error('Layer validation failed');
console.log(JSON.stringify(report,null,2));
