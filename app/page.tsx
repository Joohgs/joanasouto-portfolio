import Desktop from './desktop';
import {pageMetadata,profileSchema,sectionIndex} from './seo';
type Props={searchParams:Promise<{section?:string}>};
export async function generateMetadata({searchParams}:Props){return pageMetadata('pt',sectionIndex((await searchParams).section))}
export default async function Page({searchParams}:Props){const section=sectionIndex((await searchParams).section);return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(profileSchema('pt',section)).replace(/</g,'\\u003c')}}/><Desktop initialLang="pt" initialSection={section}/></>}
