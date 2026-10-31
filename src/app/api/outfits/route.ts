import {NextResponse} from "next/server";
import {requireUser} from "@/lib/auth";import {outfitSchema} from "@/lib/validation";export async function GET(){const {supabase,user}=await requireUser();if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});const {data,error}=await supabase.from("outfits").select("*").eq("user_id",user.id).order("created_at",{ascending:false});if(error)return NextResponse.json({error:"Load failed"},{status:400});return NextResponse.json(outfits:data});}
export async function POST(request:Request){const {supabase,user}=await requireUser();if(!user)return NextResponse.json(Ù\œ›Üˆ•[˜]]Üš^™YŸKÜİ]\Î_JNØÛÛœİ[İ]š]ØÚ[XKœØY™T\œÙJ]ØZ]™\]Y\İšœÛÛŠ
K˜Ø]Ú


OO›[
JNÚYŠ\œİXØÙ\ÜÊ\™]\›ˆ™^™\ÜÛœÙKšœÛÛŠÙ\œ›Üˆ’[˜[Yİ]š]ŸKÜİ]\ÎJNØÛÛœİ\™]NÚYŠ‹š][RYË›[™İ
^ØÛÛœİÙ\œ›Ü™_OX]ØZ]İ\X˜\ÙK™œ›ÛJ˜ÛÜÙ]Ú][\ÈŠKœÙ[Xİ
šYŠK™\J\Ù\—ÚY‹\Ù\‹šY
Kš[ŠšY‹‹š][RYÊNÚYŠJ\™]\›ˆ™^™\ÜÛœÙKšœÛÛŠÙ\œ›ÜˆÛÜÙ]ÛÚİ\˜Z[YŸKÜİ]\ÎßJ_XÛÛœİÙ]K\œ›ÜY\œŸOX]ØZ]İ\X˜\ÙK™œ›ÛJ›İ]š]ÈŠKš[œÙ\
İ\Ù\—ÚY\Ù\‹šY˜[YN‹›˜[YK\ØÜš\[Û‹™\ØÜš\[ÛŸ[ØØØ\Ú[Û‹›ØØØ\Ú[ÛŸ[\×ÜX›XÎ‹š\ÔX›XßJKœÙ[Xİ
ŠˆŠKœÚ[™ÛJ
NÚYŠ\œ‡ÇÂFF—&WGW&âæW‡E&W7öç6Ræ§6öâ‡¶W'&÷#¢%6fRf–ÆVB'ÒÇ·7FGW3£CÒ“¶–b‡bæ—FVÔ–G2æÆVæwF‚—¶6öç7B&÷w3×bæ—FVÔ–G2æÖ‚†—FVÕö–BÇ÷6—F–öâ“Óâ‡¶÷WFf—Eö–C¦FFæ–BÆ—FVÕö–BÇ÷6—F–öçÒ’“¶6öç7B¶W'&÷'ÓÖv—B7W&6Ræg&öÒ‚&÷WFf—Eö—FV×2"’æ–ç6W'B‡&÷w2“¶–b†W'&÷"—¶v—B7W&6Ræg&öÒ‚&÷WFf—G2"’æFVÆWFR‚’æW‚&–B"ÆFFæ–B’æW‚'W6W%ö–B"ÇW6W"æ–B“·&WGW&âæW‡E&W7öç6Ræ§6öâ‡¶W'&÷#¢$GF6†ÖVçBf–ÆVB'ÒÇ·7FGW3£CÒ—××&WGW&âæW‡E&W7öç6Ræ§6öâ‡¶÷WFf—C¦FFÒÇ·7FGW3£#Ò—Ğ