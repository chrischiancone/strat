(()=>{var e={};e.id=7409,e.ids=[7409],e.modules={72934:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external.js")},54580:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external.js")},45869:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},19123:(e,t,n)=>{"use strict";n.r(t),n.d(t,{GlobalError:()=>r.a,__next_app__:()=>p,originalPathname:()=>c,pages:()=>u,routeModule:()=>f,tree:()=>d}),n(7352),n(35866),n(3771);var o=n(23191),i=n(88716),a=n(37922),r=n.n(a),s=n(95231),l={};for(let e in s)0>["default","tree","pages","GlobalError","originalPathname","__next_app__","routeModule"].indexOf(e)&&(l[e]=()=>s[e]);n.d(t,l);let d=["",{children:["/_not-found",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(n.t.bind(n,35866,23)),"next/dist/client/components/not-found-error"]}]},{}]},{layout:[()=>Promise.resolve().then(n.bind(n,3771)),"/Users/cchiancone/Desktop/Stratic Plan/app/layout.tsx"],"not-found":[()=>Promise.resolve().then(n.t.bind(n,35866,23)),"next/dist/client/components/not-found-error"]}],u=[],c="/_not-found/page",p={require:n,loadChunk:()=>Promise.resolve()},f=new o.AppPageRouteModule({definition:{kind:i.x.APP_PAGE,page:"/_not-found/page",pathname:"/_not-found",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:d}})},58844:(e,t,n)=>{Promise.resolve().then(n.bind(n,48873)),Promise.resolve().then(n.bind(n,85999))},65323:(e,t,n)=>{Promise.resolve().then(n.t.bind(n,12994,23)),Promise.resolve().then(n.t.bind(n,96114,23)),Promise.resolve().then(n.t.bind(n,9727,23)),Promise.resolve().then(n.t.bind(n,79671,23)),Promise.resolve().then(n.t.bind(n,41868,23)),Promise.resolve().then(n.t.bind(n,84759,23))},48873:(e,t,n)=>{"use strict";n.d(t,{default:()=>a});var o=n(10326),i=n(17577);function a(){let[e,t]=(0,i.useState)(!1);return o.jsx("div",{id:"loading-overlay",className:`loading-overlay${e?" loaded":""}`,children:o.jsx("div",{className:"loading-spinner"})})}},3771:(e,t,n)=>{"use strict";n.r(t),n.d(t,{default:()=>u,metadata:()=>l,viewport:()=>d});var o=n(19510),i=n(85384),a=n.n(i),r=n(51032);n(67272);let s=(0,n(68570).createProxy)(String.raw`/Users/cchiancone/Desktop/Stratic Plan/components/LoadingOverlay.tsx#default`),l={title:"Strat Plan - Strategic Planning System",description:"Municipal government strategic planning and management system",formatDetection:{telephone:!1}},d={width:"device-width",initialScale:1,maximumScale:5,userScalable:!0,viewportFit:"cover",themeColor:"#486581"};function u({children:e}){return(0,o.jsxs)("html",{lang:"en",className:"h-full",children:[(0,o.jsxs)("head",{children:[o.jsx("meta",{name:"mobile-web-app-capable",content:"yes"}),o.jsx("meta",{name:"apple-mobile-web-app-capable",content:"yes"}),o.jsx("meta",{name:"apple-mobile-web-app-status-bar-style",content:"default"}),o.jsx("meta",{name:"apple-mobile-web-app-title",content:"Strategic Planning"}),o.jsx("style",{dangerouslySetInnerHTML:{__html:`
            /* Inline critical styles to prevent FOUC */
            * {
              box-sizing: border-box;
            }
            
            html {
              height: 100%;
              height: 100dvh;
              -webkit-text-size-adjust: 100%;
              -webkit-tap-highlight-color: transparent;
            }
            
            body {
              font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
              background-color: #f9fafb;
              margin: 0;
              padding: 0;
              min-height: 100vh;
              min-height: 100dvh;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
              overscroll-behavior: none;
            }
            
            /* Prevent iOS input zoom */
            input, select, textarea {
              font-size: 16px;
            }
            
            @media (max-width: 767px) {
              input, select, textarea {
                font-size: 16px !important;
              }
            }
            
            /* Loading state styles */
            .loading-overlay {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: #f9fafb;
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 9999;
              opacity: 1;
              transition: opacity 0.3s ease-out;
            }
            
            .loading-overlay.loaded {
              opacity: 0;
              pointer-events: none;
            }
            
            .loading-spinner {
              width: 40px;
              height: 40px;
              border: 4px solid #e5e7eb;
              border-left: 4px solid #3b82f6;
              border-radius: 50%;
              animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}})]}),(0,o.jsxs)("body",{className:`${a().className} h-full mobile-full-height safe-area-inset`,children:[o.jsx(s,{}),e,o.jsx(r.x7,{})]})]})}},16399:(e,t)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),function(e,t){for(var n in t)Object.defineProperty(e,n,{enumerable:!0,get:t[n]})}(t,{isNotFoundError:function(){return i},notFound:function(){return o}});let n="NEXT_NOT_FOUND";function o(){let e=Error(n);throw e.digest=n,e}function i(e){return"object"==typeof e&&null!==e&&"digest"in e&&e.digest===n}("function"==typeof t.default||"object"==typeof t.default&&null!==t.default)&&void 0===t.default.__esModule&&(Object.defineProperty(t.default,"__esModule",{value:!0}),Object.assign(t.default,t),e.exports=t.default)},7352:(e,t,n)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),function(e,t){for(var n in t)Object.defineProperty(e,n,{enumerable:!0,get:t[n]})}(t,{PARALLEL_ROUTE_DEFAULT_PATH:function(){return i},default:function(){return a}});let o=n(16399),i="next/dist/client/components/parallel-route-default.js";function a(){(0,o.notFound)()}("function"==typeof t.default||"object"==typeof t.default&&null!==t.default)&&void 0===t.default.__esModule&&(Object.defineProperty(t.default,"__esModule",{value:!0}),Object.assign(t.default,t),e.exports=t.default)},67272:()=>{}};var t=require("../../webpack-runtime.js");t.C(e);var n=e=>t(t.s=e),o=t.X(0,[9276,4121],()=>n(19123));module.exports=o})();