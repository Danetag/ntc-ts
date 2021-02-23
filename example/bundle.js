(function () {
	'use strict';

	let n={},r=[["000000","Black"]];function a(t,n=1){return [parseInt(`0x${t.substring(1,3)}`,16)/n,parseInt(`0x${t.substring(3,5)}`,16)/n,parseInt(`0x${t.substring(5,7)}`,16)/n]}function e(t){const n=a(t,255),r=n[0],o=n[1],e=n[2],s=Math.min(r,Math.min(o,e)),u=Math.max(r,Math.max(o,e)),i=u-s;let c=0,l=0;const p=(s+u)/2;return p>0&&p<1&&(l=i/(p<.5?2*p:2-2*p)),i>0&&(u===r&&u!==o&&(c+=(o-e)/i),u===o&&u!==e&&(c+=2+(e-r)/i),u===e&&u!==r&&(c+=4+(r-o)/i),c/=6),[Math.round(255*c),Math.round(255*l),Math.round(255*p)]}function s(t,n,r=!1){return {exactMatch:r,name:n,rgb:t}}function c(t){if(null==t)return s(null,"not-a-color",!1);if((t=t.toUpperCase()).length<3||t.length>7)return s(null,"not-a-color",!1);if(t.length%3==0&&(t=`#${t}`),4===t.length&&(t=`#${t.substr(1,1)}${t.substr(1,1)}${t.substr(2,1)}${t.substr(2,1)}${t.substr(3,1)}${t.substr(3,1)}`),void 0!==n[t])return n[t];const o=a(t),u=o[0],i=o[1],c=o[2],l=e(t),p=l[0],h=l[1],g=l[2];let f=0,M=0,b=0,$=-1,I=-1;for(let o=0;o<r.length;o++){let l=r[o];const S=`#${l[0]}`,w=String(l[1]);if(void 0===l[2]){const t=a(S),n=e(S);l=l.concat(t),l=l.concat(n);}if(t===S)return n[t]=s(S,w,!0),n[t];const x=parseInt(String(l[2]),10),d=parseInt(String(l[3]),10),m=parseInt(String(l[4]),10),v=parseInt(String(l[5]),10),y=parseInt(String(l[6]),10),O=parseInt(String(l[7]),10);f=Math.pow(u-x,2)+Math.pow(i-d,2)+Math.pow(c-m,2),M=Math.pow(p-v,2)+Math.pow(h-y,2)+Math.pow(g-O,2),b=f+2*M,(I<0||I>b)&&(I=b,$=o);}if($<0)return s(t,t,!1);const S=r[$],w=`#${S[0]}`,x=String(S[1]);return n[t]=s(w,x,!1),n[t]}

	const color = c('#F89EAB');

	console.log('hello world', color);

}());
