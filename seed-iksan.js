// ============================================================
// 익산청 RVDS 시설 데이터 일괄 등록 스크립트
// 실행: node seed-iksan.js
// ============================================================

const { initializeApp } = require("firebase/app");
const { getDatabase, ref, set } = require("firebase/database");

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyAC_Hbm4sRQ6t3E5XoOgYSkrShxKW6uPrM",
  authDomain: "fmsver3.firebaseapp.com",
  databaseURL: "https://fmsver3-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "fmsver3",
  storageBucket: "fmsver3.firebasestorage.app",
  messagingSenderId: "57213170355",
  appId: "1:57213170355:web:47f279a4c635f63d25f6c6",
};

const app = initializeApp(FIREBASE_CONFIG);
const db  = getDatabase(app);

const FACILITIES = [
  // ── 2022년 익산청 레이더식 차량검지기(VDS) 제조구매(설치포함) ─────────────
  { equipId:"52013VDS30102", projectName:"2022년 익산청 레이더식 차량검지기(VDS) 제조구매(설치포함)", equipName:"레이더식 차량검지기(VDS)", address:"전남 곡성군 옥과면 리문리 428-9",         ip:"10.105.32.131",  gateway:"10.105.32.254",  subnet:"255.255.255.0", mileage:"", note:"", photos:[] },
  { equipId:"52013VDE30202", projectName:"2022년 익산청 레이더식 차량검지기(VDS) 제조구매(설치포함)", equipName:"레이더식 차량검지기(VDS)", address:"전남 곡성군 오산면 운곡리 847-4",         ip:"10.105.32.132",  gateway:"10.103.32.254",  subnet:"255.255.255.0", mileage:"", note:"※게이트웨이 IP 대역 불일치 확인필요", photos:[] },
  { equipId:"52017VDS40102", projectName:"2022년 익산청 레이더식 차량검지기(VDS) 제조구매(설치포함)", equipName:"레이더식 차량검지기(VDS)", address:"전북 완주군 용진읍 상운리 41-16",        ip:"10.105.122.131", gateway:"10.105.122.254", subnet:"255.255.255.0", mileage:"", note:"", photos:[] },
  { equipId:"52019VDS40302", projectName:"2022년 익산청 레이더식 차량검지기(VDS) 제조구매(설치포함)", equipName:"레이더식 차량검지기(VDS)", address:"전북 장수군 계남면 호덕리 780-11",        ip:"10.105.104.131", gateway:"10.105.104.254", subnet:"255.255.255.0", mileage:"", note:"", photos:[] },
  { equipId:"52019VDS40102", projectName:"2022년 익산청 레이더식 차량검지기(VDS) 제조구매(설치포함)", equipName:"레이더식 차량검지기(VDS)", address:"전북 무주군 안성면 장기리 1941-15",       ip:"10.105.101.131", gateway:"10.105.101.254", subnet:"255.255.255.0", mileage:"", note:"", photos:[] },
  { equipId:"52019VDE40202", projectName:"2022년 익산청 레이더식 차량검지기(VDS) 제조구매(설치포함)", equipName:"레이더식 차량검지기(VDS)", address:"전북 무주군 무주읍 가옥리 79-1",          ip:"10.103.47.131",  gateway:"10.103.47.254",  subnet:"255.255.255.0", mileage:"", note:"", photos:[] },
  { equipId:"52022VDS40102", projectName:"2022년 익산청 레이더식 차량검지기(VDS) 제조구매(설치포함)", equipName:"레이더식 차량검지기(VDS)", address:"전북 고창군 흥덕면 석교리 197-1",         ip:"10.105.80.131",  gateway:"10.105.80.254",  subnet:"255.255.255.0", mileage:"", note:"", photos:[] },
  { equipId:"52022VDE40202", projectName:"2022년 익산청 레이더식 차량검지기(VDS) 제조구매(설치포함)", equipName:"레이더식 차량검지기(VDS)", address:"전북 고창군 흥덕면 흥덕리 513-8",         ip:"10.105.80.132",  gateway:"10.105.80.254",  subnet:"255.255.255.0", mileage:"", note:"", photos:[] },
  { equipId:"52022VDS30102", projectName:"2022년 익산청 레이더식 차량검지기(VDS) 제조구매(설치포함)", equipName:"레이더식 차량검지기(VDS)", address:"전남 순천시 승주읍 평중리 696-6",         ip:"10.103.35.13",   gateway:"10.103.35.254",  subnet:"255.255.255.0", mileage:"", note:"", photos:[] },
  { equipId:"52022VDS30202", projectName:"2022년 익산청 레이더식 차량검지기(VDS) 제조구매(설치포함)", equipName:"레이더식 차량검지기(VDS)", address:"전남 순천시 승주읍 월계리 837-3",         ip:"10.103.35.131",  gateway:"10.103.35.254",  subnet:"255.255.255.0", mileage:"", note:"", photos:[] },
  { equipId:"52023VDS30102", projectName:"2022년 익산청 레이더식 차량검지기(VDS) 제조구매(설치포함)", equipName:"레이더식 차량검지기(VDS)", address:"전남 장흥군 장흥읍 건산리 801",           ip:"10.105.14.131",  gateway:"10.105.14.254",  subnet:"255.255.255.0", mileage:"", note:"", photos:[] },
  { equipId:"52023VDS30202", projectName:"2022년 익산청 레이더식 차량검지기(VDS) 제조구매(설치포함)", equipName:"레이더식 차량검지기(VDS)", address:"전남 장흥군 부산면 내안리 938-50",        ip:"10.105.14.132",  gateway:"10.105.14.254",  subnet:"255.255.255.0", mileage:"", note:"", photos:[] },
  { equipId:"52026VDS40102", projectName:"2022년 익산청 레이더식 차량검지기(VDS) 제조구매(설치포함)", equipName:"레이더식 차량검지기(VDS)", address:"전북 군산시 개정면 발산리 618-7",         ip:"10.105.125.131", gateway:"10.105.125.254", subnet:"255.255.255.0", mileage:"", note:"", photos:[] },
  { equipId:"52030VDE40102", projectName:"2022년 익산청 레이더식 차량검지기(VDS) 제조구매(설치포함)", equipName:"레이더식 차량검지기(VDS)", address:"전라북도 임실군 임실읍 오정리 476-1",     ip:"10.105.86.131",  gateway:"10.105.86.254",  subnet:"255.255.255.0", mileage:"", note:"", photos:[] },

  // ── 2023년 익산청 국도 ITS 노후교체공사 ─────────────────────────────────
  { equipId:"05VD000000172", projectName:"2023년 익산청 국도 ITS 노후교체공사", equipName:"차량검지기(VDS)", address:"전북 군산시 대야면 지경리 932-20",         ip:"10.103.137.144", gateway:"255.255.255.254", subnet:"255.255.255.0", mileage:"", note:"", photos:[] },
  { equipId:"05VD000000164", projectName:"2023년 익산청 국도 ITS 노후교체공사", equipName:"차량검지기(VDS)", address:"전북 군산시 대야면 지경리 933-20",         ip:"10.103.137.143", gateway:"255.255.255.254", subnet:"255.255.255.0", mileage:"", note:"", photos:[] },
  { equipId:"05VD000000054", projectName:"2023년 익산청 국도 ITS 노후교체공사", equipName:"차량검지기(VDS)", address:"전북 완주군 삼례읍 해전리 230-24",         ip:"10.103.134.132", gateway:"255.255.255.254", subnet:"255.255.255.0", mileage:"", note:"", photos:[] },
  { equipId:"05VD000000083", projectName:"2023년 익산청 국도 ITS 노후교체공사", equipName:"차량검지기(VDS)", address:"전북 전주시 덕진구 화전동 687-21",         ip:"10.103.131.131", gateway:"255.255.255.254", subnet:"255.255.255.0", mileage:"", note:"", photos:[] },
  { equipId:"05VD000000201", projectName:"2023년 익산청 국도 ITS 노후교체공사", equipName:"차량검지기(VDS)", address:"전남 장성군 황룡면 신호리 산4-2",          ip:"10.103.155.133", gateway:"255.255.255.254", subnet:"255.255.255.0", mileage:"", note:"", photos:[] },
  { equipId:"05VD000000202", projectName:"2023년 익산청 국도 ITS 노후교체공사", equipName:"차량검지기(VDS)", address:"전남 장성군 동화면 용정리 453-7",          ip:"10.103.155.134", gateway:"255.255.255.254", subnet:"255.255.255.0", mileage:"", note:"", photos:[] },
  { equipId:"05VD000000071", projectName:"2023년 익산청 국도 ITS 노후교체공사", equipName:"차량검지기(VDS)", address:"전남 장성군 남면 삼태리 726-1",            ip:"10.103.155.132", gateway:"255.255.255.254", subnet:"255.255.255.0", mileage:"", note:"", photos:[] },
  { equipId:"05VD000000093", projectName:"2023년 익산청 국도 ITS 노후교체공사", equipName:"차량검지기(VDS)", address:"광주광역시 광산구 용봉동 326-2",           ip:"10.103.98.145",  gateway:"255.255.255.254", subnet:"255.255.255.0", mileage:"", note:"", photos:[] },
  { equipId:"05VD000000141", projectName:"2023년 익산청 국도 ITS 노후교체공사", equipName:"차량검지기(VDS)", address:"구례군 구례읍 원방리 354-6",               ip:"10.103.17.144",  gateway:"255.255.255.254", subnet:"255.255.255.0", mileage:"", note:"", photos:[] },
  { equipId:"05VD000000142", projectName:"2023년 익산청 국도 ITS 노후교체공사", equipName:"차량검지기(VDS)", address:"구례군 구례읍 봉서리 180-7",               ip:"10.103.17.145",  gateway:"255.255.255.254", subnet:"255.255.255.0", mileage:"", note:"", photos:[] },
  { equipId:"05VD000000154", projectName:"2023년 익산청 국도 ITS 노후교체공사", equipName:"차량검지기(VDS)", address:"구례군 마산면 냉천리 268-15",              ip:"10.103.14.146",  gateway:"255.255.255.254", subnet:"255.255.255.0", mileage:"", note:"", photos:[] },
  { equipId:"05VD000000148", projectName:"2023년 익산청 국도 ITS 노후교체공사", equipName:"차량검지기(VDS)", address:"구례군 마산면 갑산리 830-2",               ip:"10.103.17.146",  gateway:"255.255.255.254", subnet:"255.255.255.0", mileage:"", note:"", photos:[] },
  { equipId:"05VD000000155", projectName:"2023년 익산청 국도 ITS 노후교체공사", equipName:"차량검지기(VDS)", address:"구례군 광의면 지천리 1030-2",              ip:"10.103.14.147",  gateway:"255.255.255.254", subnet:"255.255.255.0", mileage:"", note:"", photos:[] },
  { equipId:"05VD000000149", projectName:"2023년 익산청 국도 ITS 노후교체공사", equipName:"차량검지기(VDS)", address:"구례군 광의면 지천리 1122-1",              ip:"10.103.17.147",  gateway:"255.255.255.254", subnet:"255.255.255.0", mileage:"", note:"", photos:[] },
  { equipId:"05VD000000152", projectName:"2023년 익산청 국도 ITS 노후교체공사", equipName:"차량검지기(VDS)", address:"구례군 산동면 신학리 94-2",               ip:"10.103.17.149",  gateway:"255.255.255.254", subnet:"255.255.255.0", mileage:"", note:"", photos:[] },
  { equipId:"05VD000000158", projectName:"2023년 익산청 국도 ITS 노후교체공사", equipName:"차량검지기(VDS)", address:"구례군 산동면 원촌리 346-1",               ip:"10.103.14.149",  gateway:"255.255.255.254", subnet:"255.255.255.0", mileage:"", note:"", photos:[] },
  { equipId:"05VD000000159", projectName:"2023년 익산청 국도 ITS 노후교체공사", equipName:"차량검지기(VDS)", address:"구례군 산동면 계천리 23-5",                ip:"10.103.14.150",  gateway:"255.255.255.254", subnet:"255.255.255.0", mileage:"", note:"", photos:[] },
  { equipId:"05VD000000160", projectName:"2023년 익산청 국도 ITS 노후교체공사", equipName:"차량검지기(VDS)", address:"구례군 산동면 계천리 산 53-1",             ip:"10.103.17.151",  gateway:"255.255.255.254", subnet:"255.255.255.0", mileage:"", note:"", photos:[] },
  { equipId:"05VD000000161", projectName:"2023년 익산청 국도 ITS 노후교체공사", equipName:"차량검지기(VDS)", address:"남원시 주천면 송치리 산 197-1",            ip:"10.103.26.132",  gateway:"255.255.255.254", subnet:"255.255.255.0", mileage:"", note:"", photos:[] },
  { equipId:"05VD000000153", projectName:"2023년 익산청 국도 ITS 노후교체공사", equipName:"차량검지기(VDS)", address:"남원시 주천면 송치리 산 140-2",            ip:"10.103.26.131",  gateway:"255.255.255.254", subnet:"255.255.255.0", mileage:"", note:"", photos:[] },
  { equipId:"05VD000000162", projectName:"2023년 익산청 국도 ITS 노후교체공사", equipName:"차량검지기(VDS)", address:"남원시 이백면 초촌리 산151-1",             ip:"10.103.26.133",  gateway:"255.255.255.254", subnet:"255.255.255.0", mileage:"", note:"", photos:[] },
  { equipId:"05VD000000163", projectName:"2023년 익산청 국도 ITS 노후교체공사", equipName:"차량검지기(VDS)", address:"남원시 이백면 척문리 832-300",             ip:"10.103.26.134",  gateway:"255.255.255.254", subnet:"255.255.255.0", mileage:"", note:"", photos:[] },
  { equipId:"05VD000000147", projectName:"2023년 익산청 국도 ITS 노후교체공사", equipName:"차량검지기(VDS)", address:"임실군 관촌면 슬치리 178",                 ip:"10.103.173.132", gateway:"255.255.255.254", subnet:"255.255.255.0", mileage:"", note:"", photos:[] },
  { equipId:"05VD000000012", projectName:"2023년 익산청 국도 ITS 노후교체공사", equipName:"차량검지기(VDS)", address:"전남 무안군 삼향읍 지산리 산 146-26",      ip:"10.103.224.138", gateway:"255.255.255.254", subnet:"255.255.255.0", mileage:"", note:"", photos:[] },
  { equipId:"05VD000000070", projectName:"2023년 익산청 국도 ITS 노후교체공사", equipName:"차량검지기(VDS)", address:"전남 무안군 삼향읍 지산리 650",            ip:"10.103.227.144", gateway:"255.255.255.254", subnet:"255.255.255.0", mileage:"", note:"", photos:[] },
  { equipId:"05VD000000069", projectName:"2023년 익산청 국도 ITS 노후교체공사", equipName:"차량검지기(VDS)", address:"전남 무안군 청계면 도림리 580-7",          ip:"10.103.224.136", gateway:"255.255.255.254", subnet:"255.255.255.0", mileage:"", note:"", photos:[] },
  { equipId:"05VD000000068", projectName:"2023년 익산청 국도 ITS 노후교체공사", equipName:"차량검지기(VDS)", address:"전남 무안군 청계면 태봉리 730",            ip:"10.103.224.135", gateway:"255.255.255.254", subnet:"255.255.255.0", mileage:"", note:"", photos:[] },
  { equipId:"05VD000000067", projectName:"2023년 익산청 국도 ITS 노후교체공사", equipName:"차량검지기(VDS)", address:"전남 무안군 청계면 사마리 809-14",         ip:"10.103.227.143", gateway:"255.255.255.254", subnet:"255.255.255.0", mileage:"", note:"", photos:[] },
  { equipId:"05VD000000066", projectName:"2023년 익산청 국도 ITS 노후교체공사", equipName:"차량검지기(VDS)", address:"전남 무안군 무안읍 교촌리 산 38-3",        ip:"10.103.224.134", gateway:"255.255.255.254", subnet:"255.255.255.0", mileage:"", note:"", photos:[] },
  { equipId:"05VD000000042", projectName:"2023년 익산청 국도 ITS 노후교체공사", equipName:"차량검지기(VDS)", address:"전남 나주시 대기동 377-2",                 ip:"10.103.104.180", gateway:"255.255.255.254", subnet:"255.255.255.0", mileage:"", note:"", photos:[] },
  { equipId:"05VD000000043", projectName:"2023년 익산청 국도 ITS 노후교체공사", equipName:"차량검지기(VDS)", address:"전남 나주시 평산동 350-26",                ip:"10.103.101.134", gateway:"255.255.255.254", subnet:"255.255.255.0", mileage:"", note:"", photos:[] },
  { equipId:"05VD000000044", projectName:"2023년 익산청 국도 ITS 노후교체공사", equipName:"차량검지기(VDS)", address:"전남 나주시 평산동 산 7-9",                ip:"10.103.104.138", gateway:"255.255.255.254", subnet:"255.255.255.0", mileage:"", note:"", photos:[] },
  { equipId:"05VD000000075", projectName:"2023년 익산청 국도 ITS 노후교체공사", equipName:"차량검지기(VDS)", address:"전남 나주시 부덕동 23-16",                 ip:"10.103.107.136", gateway:"255.255.255.254", subnet:"255.255.255.0", mileage:"", note:"", photos:[] },
  { equipId:"05VD000000036", projectName:"2023년 익산청 국도 ITS 노후교체공사", equipName:"차량검지기(VDS)", address:"전남 나주시 다시면 영동리 1-28",           ip:"10.103.104.134", gateway:"255.255.255.254", subnet:"255.255.255.0", mileage:"", note:"", photos:[] },
  { equipId:"05VD000000037", projectName:"2023년 익산청 국도 ITS 노후교체공사", equipName:"차량검지기(VDS)", address:"전남 나주시 다시면 복암리 851-2",          ip:"10.103.101.133", gateway:"255.255.255.254", subnet:"255.255.255.0", mileage:"", note:"", photos:[] },
  { equipId:"05VD000000038", projectName:"2023년 익산청 국도 ITS 노후교체공사", equipName:"차량검지기(VDS)", address:"전남 나주시 다시면 복암리 872-30",         ip:"10.103.107.132", gateway:"255.255.255.254", subnet:"255.255.255.0", mileage:"", note:"", photos:[] },
  { equipId:"05VD000000039", projectName:"2023년 익산청 국도 ITS 노후교체공사", equipName:"차량검지기(VDS)", address:"전남 나주시 동수동 212-4",                 ip:"10.103.104.135", gateway:"255.255.255.254", subnet:"255.255.255.0", mileage:"", note:"", photos:[] },
  { equipId:"05VD000000040", projectName:"2023년 익산청 국도 ITS 노후교체공사", equipName:"차량검지기(VDS)", address:"전남 나주시 동수동 23-76",                 ip:"10.103.107.133", gateway:"255.255.255.254", subnet:"255.255.255.0", mileage:"", note:"", photos:[] },
  { equipId:"05VD000000041", projectName:"2023년 익산청 국도 ITS 노후교체공사", equipName:"차량검지기(VDS)", address:"전남 나주시 왕곡면 장산리 578-3",          ip:"10.103.104.136", gateway:"255.255.255.254", subnet:"255.255.255.0", mileage:"", note:"", photos:[] },
  { equipId:"05VD000000085", projectName:"2023년 익산청 국도 ITS 노후교체공사", equipName:"차량검지기(VDS)", address:"전남 무안군 일로읍 죽산리 1565",           ip:"10.103.62.131",  gateway:"255.255.255.254", subnet:"255.255.255.0", mileage:"", note:"", photos:[] },
  { equipId:"05VD000000086", projectName:"2023년 익산청 국도 ITS 노후교체공사", equipName:"차량검지기(VDS)", address:"전남 무안군 일로읍 청호리 산 4-6",         ip:"10.103.65.132",  gateway:"255.255.255.254", subnet:"255.255.255.0", mileage:"", note:"", photos:[] },
  { equipId:"05VD000000094", projectName:"2023년 익산청 국도 ITS 노후교체공사", equipName:"차량검지기(VDS)", address:"전남 나주시 노안면 학산리 산 41-3",        ip:"10.103.95.137",  gateway:"255.255.255.254", subnet:"255.255.255.0", mileage:"", note:"", photos:[] },
  { equipId:"05VD000000087", projectName:"2023년 익산청 국도 ITS 노후교체공사", equipName:"차량검지기(VDS)", address:"전남 영암군 학산면 매월리 산 41-8",        ip:"10.103.59.131",  gateway:"255.255.255.254", subnet:"255.255.255.0", mileage:"", note:"", photos:[] },
  { equipId:"05VD000000055", projectName:"2023년 익산청 국도 ITS 노후교체공사", equipName:"차량검지기(VDS)", address:"나주시 산포면 등정리 12-2",                ip:"10.103.104.139", gateway:"255.255.255.254", subnet:"255.255.255.0", mileage:"", note:"", photos:[] },
  { equipId:"05VD000000045", projectName:"2023년 익산청 국도 ITS 노후교체공사", equipName:"차량검지기(VDS)", address:"나주시 금천면 죽촌리 1-18",                ip:"10.103.107.134", gateway:"255.255.255.254", subnet:"255.255.255.0", mileage:"", note:"", photos:[] },
  { equipId:"05VD000000077", projectName:"2023년 익산청 국도 ITS 노후교체공사", equipName:"차량검지기(VDS)", address:"나주시 금천면 석전리 336-20",              ip:"10.103.107.137", gateway:"255.255.255.254", subnet:"255.255.255.0", mileage:"", note:"", photos:[] },
  { equipId:"05VD000000076", projectName:"2023년 익산청 국도 ITS 노후교체공사", equipName:"차량검지기(VDS)", address:"나주시 금천면 광암리 6-24",                ip:"10.103.104.140", gateway:"255.255.255.254", subnet:"255.255.255.0", mileage:"", note:"", photos:[] },
  { equipId:"05VD000000078", projectName:"2023년 익산청 국도 ITS 노후교체공사", equipName:"차량검지기(VDS)", address:"나주시 산포면 등정리 840-5",               ip:"10.103.107.138", gateway:"255.255.255.254", subnet:"255.255.255.0", mileage:"", note:"", photos:[] },
  { equipId:"05VD000000079", projectName:"2023년 익산청 국도 ITS 노후교체공사", equipName:"차량검지기(VDS)", address:"나주시 남평읍 광이리 36-9",                ip:"10.103.104.141", gateway:"255.255.255.254", subnet:"255.255.255.0", mileage:"", note:"", photos:[] },
  { equipId:"05VD000000120", projectName:"2023년 익산청 국도 ITS 노후교체공사", equipName:"차량검지기(VDS)", address:"순천시 서면 압곡리 학구리 산234",           ip:"10.103.14.180",  gateway:"255.255.255.254", subnet:"255.255.255.0", mileage:"", note:"", photos:[] },
  { equipId:"05VD000000137", projectName:"2023년 익산청 국도 ITS 노후교체공사", equipName:"차량검지기(VDS)", address:"순천시 월등면 계월리 101-2",               ip:"10.103.17.142",  gateway:"255.255.255.254", subnet:"255.255.255.0", mileage:"", note:"", photos:[] },
  { equipId:"05VD000000138", projectName:"2023년 익산청 국도 ITS 노후교체공사", equipName:"차량검지기(VDS)", address:"순천시 월등면 계월리 820",                 ip:"10.103.14.143",  gateway:"255.255.255.254", subnet:"255.255.255.0", mileage:"", note:"", photos:[] },
  { equipId:"05VD000000114", projectName:"2023년 익산청 국도 ITS 노후교체공사", equipName:"차량검지기(VDS)", address:"순천시 황전면 월산리 213-128",             ip:"10.103.17.137",  gateway:"255.255.255.254", subnet:"255.255.255.0", mileage:"", note:"", photos:[] },
  { equipId:"05VD000000115", projectName:"2023년 익산청 국도 ITS 노후교체공사", equipName:"차량검지기(VDS)", address:"순천시 황전면 월산리 24-4",                ip:"10.103.14.135",  gateway:"255.255.255.254", subnet:"255.255.255.0", mileage:"", note:"", photos:[] },
  { equipId:"05VD000000139", projectName:"2023년 익산청 국도 ITS 노후교체공사", equipName:"차량검지기(VDS)", address:"순천시 황전면 봉덕리 61",                  ip:"10.103.17.143",  gateway:"255.255.255.254", subnet:"255.255.255.0", mileage:"", note:"", photos:[] },
  { equipId:"05VD000000140", projectName:"2023년 익산청 국도 ITS 노후교체공사", equipName:"차량검지기(VDS)", address:"순천시 황전면 금평리 584-24",              ip:"10.103.14.144",  gateway:"255.255.255.254", subnet:"255.255.255.0", mileage:"", note:"", photos:[] },
  { equipId:"05VD000000103", projectName:"2023년 익산청 국도 ITS 노후교체공사", equipName:"차량검지기(VDS)", address:"순천시 해룡면 신대리 산34-15",             ip:"10.103.212.138", gateway:"255.255.255.254", subnet:"255.255.255.0", mileage:"", note:"", photos:[] },
  { equipId:"05VD000000122", projectName:"2023년 익산청 국도 ITS 노후교체공사", equipName:"차량검지기(VDS)", address:"여수시 미평동 산23-1(만흥IC일원)",         ip:"192.168.121.1",  gateway:"255.255.255.254", subnet:"255.255.255.0", mileage:"", note:"※별도 사설IP 네트워크", photos:[] },
  { equipId:"05VD000000143", projectName:"2023년 익산청 국도 ITS 노후교체공사", equipName:"차량검지기(VDS)", address:"전남 여수시 해산동 378",                   ip:"10.103.212.145", gateway:"255.255.255.254", subnet:"255.255.255.0", mileage:"", note:"", photos:[] },
  { equipId:"05VD000000116", projectName:"2023년 익산청 국도 ITS 노후교체공사", equipName:"차량검지기(VDS)", address:"전남 여수시 월하동 산91-3",                ip:"10.103.212.140", gateway:"255.255.255.254", subnet:"255.255.255.0", mileage:"", note:"", photos:[] },
];

async function seed() {
  console.log(`\n🚀 Firebase RTDB 시설 데이터 일괄 등록 시작 (총 ${FACILITIES.length}건)\n`);
  let ok = 0, fail = 0;

  for (const f of FACILITIES) {
    const id = `iksan_${f.equipId}`;
    const record = { ...f, id };
    try {
      await set(ref(db, "facilities/" + id), record);
      console.log(`  ✅ [${String(++ok).padStart(2)}] ${f.equipId}  ${f.address}`);
    } catch (e) {
      console.error(`  ❌ FAIL ${f.equipId}: ${e.message}`);
      fail++;
    }
  }

  console.log(`\n${"─".repeat(60)}`);
  console.log(`  완료: ${ok}건 성공 / ${fail}건 실패`);
  console.log(`${"─".repeat(60)}\n`);
  process.exit(0);
}

seed();
