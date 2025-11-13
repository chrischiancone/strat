"use strict";(()=>{var e={};e.id=2267,e.ids=[2267],e.modules={20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},61282:e=>{e.exports=require("child_process")},84770:e=>{e.exports=require("crypto")},80665:e=>{e.exports=require("dns")},17702:e=>{e.exports=require("events")},92048:e=>{e.exports=require("fs")},32615:e=>{e.exports=require("http")},35240:e=>{e.exports=require("https")},98216:e=>{e.exports=require("net")},19801:e=>{e.exports=require("os")},55315:e=>{e.exports=require("path")},68621:e=>{e.exports=require("punycode")},76162:e=>{e.exports=require("stream")},82452:e=>{e.exports=require("tls")},17360:e=>{e.exports=require("url")},21764:e=>{e.exports=require("util")},71568:e=>{e.exports=require("zlib")},48006:(e,t,r)=>{r.r(t),r.d(t,{originalPathname:()=>x,patchFetch:()=>y,requestAsyncStorage:()=>m,routeModule:()=>d,serverHooks:()=>g,staticGenerationAsyncStorage:()=>f});var i={};r.r(i),r.d(i,{POST:()=>l,runtime:()=>c});var s=r(49303),o=r(88716),n=r(60670),a=r(87070),p=r(55245),u=r(99064);let c="nodejs";async function l(e){try{let{recipient:t,municipalityId:r}=await e.json();if(!t||!r)return a.NextResponse.json({error:"Missing recipient or municipalityId"},{status:400});let i=(0,u.R)(),{data:s,error:o}=await i.from("municipalities").select("id, name, slug").eq("id",r).single();if(o||!s)return a.NextResponse.json({error:"Municipality not found"},{status:404});let n=p.createTransporter({host:process.env.SMTP_HOST||"127.0.0.1",port:Number(process.env.SMTP_PORT||1025),secure:"true"===(process.env.SMTP_SECURE||"false"),auth:process.env.SMTP_USER?{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS}:void 0}),c=`[Test] Stratic Plan Notification System - ${s.name}`,l=new Date().toLocaleString(),d=`\\uD83E\\uDDEA Test Notification

Municipality: ${s.name}
Recipient: ${t}
Timestamp: ${l}

This is a test notification from your Stratic Plan notification system.
If you receive this email, your notification settings are configured correctly.

✅ Notification system is working properly!

---
Stratic Plan - Strategic Planning System
This is an automated message. Please do not reply.`,m=`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">🧪 Test Notification</h2>
        
        <div style="background: #f0f9f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p><strong>Municipality:</strong> ${s.name}</p>
          <p><strong>Recipient:</strong> ${t}</p>
          <p><strong>Timestamp:</strong> ${l}</p>
        </div>
        
        <p>This is a test notification from your Stratic Plan notification system.</p>
        <p>If you receive this email, your notification settings are configured correctly.</p>
        
        <div style="background: #ecfdf5; border: 1px solid #10b981; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="color: #065f46; margin: 0;"><strong>✅ Notification system is working properly!</strong></p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
        <p style="font-size: 12px; color: #6b7280;">
          <strong>Stratic Plan</strong> - Strategic Planning System<br>
          This is an automated message. Please do not reply.
        </p>
      </div>
    `,f=await n.sendMail({from:process.env.SMTP_FROM||`"${s.name} System" <no-reply@${s.slug}.gov>`,to:t,subject:c,text:d,html:m});return a.NextResponse.json({ok:!0,messageId:f.messageId,recipient:t,municipality:s.name})}catch(t){console.error("Test notification error:",t);let e=t instanceof Error?t.message:"Unknown error";return a.NextResponse.json({error:e},{status:500})}}let d=new s.AppRouteRouteModule({definition:{kind:o.x.APP_ROUTE,page:"/api/notifications/test/route",pathname:"/api/notifications/test",filename:"route",bundlePath:"app/api/notifications/test/route"},resolvedPagePath:"/Users/cchiancone/Desktop/Stratic Plan/app/api/notifications/test/route.ts",nextConfigOutput:"standalone",userland:i}),{requestAsyncStorage:m,staticGenerationAsyncStorage:f,serverHooks:g}=d,x="/api/notifications/test/route";function y(){return(0,n.patchFetch)({serverHooks:g,staticGenerationAsyncStorage:f})}},99064:(e,t,r)=>{r.d(t,{R:()=>s});var i=r(61657);function s(){let e="http://127.0.0.1:54321",t=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!e||!t)throw Error("Missing Supabase environment variables");return(0,i.eI)(e,t,{auth:{autoRefreshToken:!1,persistSession:!1}})}}};var t=require("../../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),i=t.X(0,[9276,8377,5972,5245],()=>r(48006));module.exports=i})();