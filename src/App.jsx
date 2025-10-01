import React, { useState, useEffect, useMemo } from 'react';
import {
  Check,
  X,
  AlertCircle,
  Calendar,
  Users,
  Save,
  Download,
  Trash2,
  FileText,
} from 'lucide-react';

// 📥 Öğrenci verileri (sabit JSON)
const STUDENT_DATA = [
  {
    "ad": "ADA",
    "soyad": "KURUBACAK",
    "sinif": "11",
    "sube": "SAY1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5540158841.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5444300565"
      }
    ]
  },
  {
    "ad": "AHMET YUSUF",
    "soyad": "ÖZEN",
    "sinif": "12",
    "sube": "SAY2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5307260730.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5363231298"
      }
    ]
  },
  {
    "ad": "AHSEN SENA",
    "soyad": "KONUKCU",
    "sinif": "MEZUN",
    "sube": "MEA3",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5383661510.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5393869738"
      }
    ]
  },
  {
    "ad": "ALİ",
    "soyad": "GÜLTEKİN",
    "sinif": "9",
    "sube": "nan",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5437404419.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5353843099"
      }
    ]
  },
  {
    "ad": "ALİ ARDA",
    "soyad": "ŞEN",
    "sinif": "12",
    "sube": "EA1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5324408714.0"
      },
      {
        "alan": "e_mail",
        "deger": "senaliarda3460@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5399506255"
      }
    ]
  },
  {
    "ad": "ALİ CEYHUN",
    "soyad": "GÖKCEVİZ",
    "sinif": "MEZUN",
    "sube": "MEA1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5423322739.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5444423686"
      }
    ]
  },
  {
    "ad": "ALİ EFE",
    "soyad": "MOHAMMED",
    "sinif": "11",
    "sube": "SAY1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5398291789.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5387633646"
      }
    ]
  },
  {
    "ad": "ALİ KAAN",
    "soyad": "KANAATLI",
    "sinif": "MEZUN",
    "sube": "MEA2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5315098242.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5382098242"
      }
    ]
  },
  {
    "ad": "ALİ TALHA",
    "soyad": "YEŞİLYURT",
    "sinif": "12",
    "sube": "SAY3",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5516469328.0"
      },
      {
        "alan": "e_mail",
        "deger": "talhayslyrt.28@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5389202868\n5316160011"
      }
    ]
  },
  {
    "ad": "ALPASLAN",
    "soyad": "KARAKOYUN",
    "sinif": "12",
    "sube": "SAY2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5519377252.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5054296295"
      }
    ]
  },
  {
    "ad": "ALPEREN",
    "soyad": "ÜNER",
    "sinif": "11",
    "sube": "SAY1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5323748361.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5365477459"
      }
    ]
  },
  {
    "ad": "ARAM",
    "soyad": "CANSU",
    "sinif": "11",
    "sube": "EA1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5459746430.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5365075025"
      }
    ]
  },
  {
    "ad": "ARDA",
    "soyad": "PARLAK",
    "sinif": "12",
    "sube": "EA2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5386172043.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5377755713"
      }
    ]
  },
  {
    "ad": "ARDA",
    "soyad": "TOPRAKÇI",
    "sinif": "11",
    "sube": "SAY1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5065885750.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5305600344"
      }
    ]
  },
  {
    "ad": "ARDA",
    "soyad": "ŞANLIOĞLU",
    "sinif": "MEZUN",
    "sube": "MSAY3",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5510758274.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5444965114"
      }
    ]
  },
  {
    "ad": "ARDA",
    "soyad": "UZ",
    "sinif": "12",
    "sube": "SAY3",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5523578932.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5065838932"
      }
    ]
  },
  {
    "ad": "ARDA",
    "soyad": "SERÇE",
    "sinif": "MEZUN",
    "sube": "MEA1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5519680875.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5466051327"
      }
    ]
  },
  {
    "ad": "ARDACAN",
    "soyad": "AYDEMİR",
    "sinif": "11",
    "sube": "EA1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5525056246.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5382146231"
      }
    ]
  },
  {
    "ad": "ARVEN",
    "soyad": "GALOLAR",
    "sinif": "MEZUN",
    "sube": "MSAY2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5389342986.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5326783537"
      }
    ]
  },
  {
    "ad": "ARZU GÜL",
    "soyad": "KONUKCU",
    "sinif": "MEZUN",
    "sube": "MEA3",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5518373380.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5393869738"
      }
    ]
  },
  {
    "ad": "ASEL",
    "soyad": "CEBECİ",
    "sinif": "12",
    "sube": "SAY1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5510755640.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5537112529"
      }
    ]
  },
  {
    "ad": "ASYA",
    "soyad": "SARIBAŞ",
    "sinif": "MEZUN",
    "sube": "MEA1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5385170246.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5357939293"
      }
    ]
  },
  {
    "ad": "ATAKAN",
    "soyad": "OFLAZ",
    "sinif": "12",
    "sube": "SAY3",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5352780301.0"
      },
      {
        "alan": "e_mail",
        "deger": "atakanoflaz927@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5342663360"
      }
    ]
  },
  {
    "ad": "AVŞİN",
    "soyad": "AKÇİLAD",
    "sinif": "9",
    "sube": "nan",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5317441034.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5516680664"
      }
    ]
  },
  {
    "ad": "AYDA",
    "soyad": "SARIÇOBAN",
    "sinif": "11",
    "sube": "EA2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5353487976.0"
      },
      {
        "alan": "e_mail",
        "deger": "aydasaricoban@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5333717603"
      }
    ]
  },
  {
    "ad": "AYDIN CAN",
    "soyad": "UMAR",
    "sinif": "12",
    "sube": "SAY3",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5386858938.0"
      },
      {
        "alan": "e_mail",
        "deger": "aydincanumar@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5316994412"
      }
    ]
  },
  {
    "ad": "AYŞE",
    "soyad": "H. ÇELEBİ",
    "sinif": "MEZUN",
    "sube": "TYT",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5011731537.0"
      },
      {
        "alan": "e_mail",
        "deger": "celebayse08@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5388634726"
      }
    ]
  },
  {
    "ad": "AYŞE NAZ",
    "soyad": "ÜNLÜ",
    "sinif": "MEZUN",
    "sube": "MEA3",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5526704296.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5326402409"
      }
    ]
  },
  {
    "ad": "AYŞE ZEHRA",
    "soyad": "ÇOLAK",
    "sinif": "12",
    "sube": "EA2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5522865158.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5534015396"
      }
    ]
  },
  {
    "ad": "AYŞENUR ALMİNA",
    "soyad": "AKGÖZ",
    "sinif": "MEZUN",
    "sube": "MSAY1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5448428477.0"
      },
      {
        "alan": "e_mail",
        "deger": "akgozaysenuralmina@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5063011431"
      }
    ]
  },
  {
    "ad": "AZİZ ARDA",
    "soyad": "KÖSE",
    "sinif": "11",
    "sube": "EA1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5302742428.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5336832333"
      }
    ]
  },
  {
    "ad": "BARAN",
    "soyad": "ÇINAR",
    "sinif": "10",
    "sube": "nan",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5050287773.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5059823110"
      }
    ]
  },
  {
    "ad": "BARAN",
    "soyad": "ALKAN",
    "sinif": "12",
    "sube": "SAY1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5518445077.0"
      },
      {
        "alan": "e_mail",
        "deger": "baranalkann2008@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5323742181"
      }
    ]
  },
  {
    "ad": "BARAN EFE",
    "soyad": "UYGUN",
    "sinif": "12",
    "sube": "EA1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5537874383.0"
      },
      {
        "alan": "e_mail",
        "deger": "baranefeuygun34@icloud.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5454873340"
      }
    ]
  },
  {
    "ad": "BARLAS BATIN",
    "soyad": "DERİNDERE",
    "sinif": "11",
    "sube": "SAY1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5388436903.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5333171882"
      }
    ]
  },
  {
    "ad": "BAŞAK VEHBİYE",
    "soyad": "BULUT",
    "sinif": "MEZUN",
    "sube": "MSAY1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5454823421.0"
      },
      {
        "alan": "e_mail",
        "deger": "buluttbasak2008@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5076035556"
      }
    ]
  },
  {
    "ad": "BATUHAN",
    "soyad": "TARHAN",
    "sinif": "12",
    "sube": "EA1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5525360206.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5444941391"
      }
    ]
  },
  {
    "ad": "BEDRİYE HANZADE",
    "soyad": "KÖYLÜ",
    "sinif": "12",
    "sube": "SAY2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5424918278.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5074918278"
      }
    ]
  },
  {
    "ad": "BERAT",
    "soyad": "ÖZELCİ",
    "sinif": "11",
    "sube": "SAY2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5419502080.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5333244946"
      }
    ]
  },
  {
    "ad": "BERAT",
    "soyad": "YILDIRIM",
    "sinif": "11",
    "sube": "EA1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5511472504.0"
      },
      {
        "alan": "e_mail",
        "deger": "beratyildirim13@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5387386637"
      }
    ]
  },
  {
    "ad": "BERAT METEAN",
    "soyad": "ÇAL",
    "sinif": "12",
    "sube": "SAY3",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5526689752.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5414865572"
      }
    ]
  },
  {
    "ad": "BERAT TALHA",
    "soyad": "AÇIKGÖZ",
    "sinif": "12",
    "sube": "SAY1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5510679356.0"
      },
      {
        "alan": "e_mail",
        "deger": "talhaacikgoz66@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5433523608\n5398136820"
      }
    ]
  },
  {
    "ad": "BEREN",
    "soyad": "KOÇAK",
    "sinif": "11",
    "sube": "SAY1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5057476052.0"
      },
      {
        "alan": "e_mail",
        "deger": "berenkoc52@icloud.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5541576952"
      }
    ]
  },
  {
    "ad": "BEREN ÜLKÜ",
    "soyad": "YAYLA",
    "sinif": "MEZUN",
    "sube": "MSAY1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5523754357.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5468486230"
      }
    ]
  },
  {
    "ad": "BERK CEMAL",
    "soyad": "CEYHAN",
    "sinif": "9",
    "sube": "nan",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5055403373.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5055367635"
      }
    ]
  },
  {
    "ad": "BERKE",
    "soyad": "BERBER",
    "sinif": "12",
    "sube": "EA2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5377868178.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5077201350"
      }
    ]
  },
  {
    "ad": "BERRA",
    "soyad": "BİLİCİ",
    "sinif": "12",
    "sube": "EA3",
    "iletisim": [
      {
        "alan": "veli_iletisim",
        "deger": "5385780220"
      }
    ]
  },
  {
    "ad": "BERRAK",
    "soyad": "DOĞAN",
    "sinif": "MEZUN",
    "sube": "MSAY3",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5078848340.0"
      },
      {
        "alan": "e_mail",
        "deger": "berrakdogan948@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5352913023"
      }
    ]
  },
  {
    "ad": "BETÜL",
    "soyad": "FİDAN",
    "sinif": "11",
    "sube": "SAY1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5518899261.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5050423958"
      }
    ]
  },
  {
    "ad": "BETÜL",
    "soyad": "KAYA",
    "sinif": "12",
    "sube": "EA3",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5514894990.0"
      },
      {
        "alan": "e_mail",
        "deger": "bbetul.ky34@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5362288543"
      }
    ]
  },
  {
    "ad": "BETÜL SUDE",
    "soyad": "YAVUZ",
    "sinif": "11",
    "sube": "EA2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5527435218.0"
      },
      {
        "alan": "e_mail",
        "deger": "seymayavuz2429@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5362984541"
      }
    ]
  },
  {
    "ad": "BEYTULLAH",
    "soyad": "BAŞKAN",
    "sinif": "12",
    "sube": "SAY1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5516880645.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5343060337"
      }
    ]
  },
  {
    "ad": "BEYZA",
    "soyad": "ÇINAR",
    "sinif": "12",
    "sube": "TYT",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5343812334.0"
      },
      {
        "alan": "e_mail",
        "deger": "beyzacnr3458@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5424892044"
      }
    ]
  },
  {
    "ad": "BEYZA",
    "soyad": "KESİK",
    "sinif": "MEZUN",
    "sube": "MSAY2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5511644210.0"
      },
      {
        "alan": "e_mail",
        "deger": "bbeyzakesikk435@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5384970025"
      }
    ]
  },
  {
    "ad": "BUĞRA EMİR",
    "soyad": "BENLİCE",
    "sinif": "12",
    "sube": "EA2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5510737439.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5372796113"
      }
    ]
  },
  {
    "ad": "BUĞRAHAN",
    "soyad": "AY",
    "sinif": "10",
    "sube": "nan",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5345794450.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5395495150"
      }
    ]
  },
  {
    "ad": "BURAK EFE",
    "soyad": "KARAMAN",
    "sinif": "MEZUN",
    "sube": "MSAY1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5523463419.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5374873419"
      }
    ]
  },
  {
    "ad": "BURAK EREN",
    "soyad": "ERDİ",
    "sinif": "MEZUN",
    "sube": "MSAY3",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5333054725.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5357146537"
      }
    ]
  },
  {
    "ad": "BURAK KAYRA",
    "soyad": "GÜÇLÜGİL",
    "sinif": "12",
    "sube": "SAY2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5452332229.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5309701604"
      }
    ]
  },
  {
    "ad": "BURCU",
    "soyad": "DURĞAY",
    "sinif": "MEZUN",
    "sube": "MSAY1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5466854667.0"
      },
      {
        "alan": "e_mail",
        "deger": "burcudurgay3434@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5359299993"
      }
    ]
  },
  {
    "ad": "BÜŞRA HİLAL",
    "soyad": "ÇATALTEPE",
    "sinif": "11",
    "sube": "EA1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5377287750.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5367208625"
      }
    ]
  },
  {
    "ad": "CANAN GÜL",
    "soyad": "SAĞLAM",
    "sinif": "MEZUN",
    "sube": "TYT",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5518694065.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5377933320"
      }
    ]
  },
  {
    "ad": "CANSU",
    "soyad": "BALCI",
    "sinif": "11",
    "sube": "SAY1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5524462309.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5383205851"
      }
    ]
  },
  {
    "ad": "CEMİLE ASYA",
    "soyad": "ALPHAN",
    "sinif": "11",
    "sube": "SAY2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5525632557.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5336617739"
      }
    ]
  },
  {
    "ad": "CEMRE ÖYKÜ",
    "soyad": "ÖMÜR",
    "sinif": "MEZUN",
    "sube": "MEA2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5334911328.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5358768227"
      }
    ]
  },
  {
    "ad": "CEREN",
    "soyad": "KARATAŞ",
    "sinif": "12",
    "sube": "TYT",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5467129359.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5336266636"
      }
    ]
  },
  {
    "ad": "CEREN",
    "soyad": "CEYLAN",
    "sinif": "11",
    "sube": "EA1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5413575390.0"
      },
      {
        "alan": "e_mail",
        "deger": "cerenceylan329@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5348439681"
      }
    ]
  },
  {
    "ad": "CEREN",
    "soyad": "YILDIRIM",
    "sinif": "MEZUN",
    "sube": "MEA3",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5362602336.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5382511646"
      }
    ]
  },
  {
    "ad": "CEREN",
    "soyad": "BIÇAKCI",
    "sinif": "12",
    "sube": "SAY2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5523404437.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5457327385"
      }
    ]
  },
  {
    "ad": "CEREN ŞEVVAL",
    "soyad": "BAYSAL",
    "sinif": "12",
    "sube": "EA3",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5350103004.0"
      },
      {
        "alan": "e_mail",
        "deger": "rnbysl34@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5362484543"
      }
    ]
  },
  {
    "ad": "CEYDA",
    "soyad": "ÇEVİK",
    "sinif": "12",
    "sube": "EA1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5399897473.0"
      },
      {
        "alan": "e_mail",
        "deger": "ceydacevik3455@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5399897472"
      }
    ]
  },
  {
    "ad": "ÇAĞAN CEMAL",
    "soyad": "KAYA",
    "sinif": "9",
    "sube": "nan",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5527908320.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5309565058"
      }
    ]
  },
  {
    "ad": "ÇAĞATAY",
    "soyad": "DOĞAN",
    "sinif": "MEZUN",
    "sube": "MSAY2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5362360886.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5442170837"
      }
    ]
  },
  {
    "ad": "ÇAĞLA",
    "soyad": "KILIÇ",
    "sinif": "11",
    "sube": "SAY2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5539728989.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5532506104"
      }
    ]
  },
  {
    "ad": "ÇINAR",
    "soyad": "ARIK",
    "sinif": "12",
    "sube": "SAY1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5078567597.0"
      },
      {
        "alan": "e_mail",
        "deger": "cinarariks@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5078567595"
      }
    ]
  },
  {
    "ad": "ÇINAR",
    "soyad": "CEYHAN",
    "sinif": "MEZUN",
    "sube": "MEA1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5446707341.0"
      },
      {
        "alan": "e_mail",
        "deger": "cinarcey2007@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5325145150"
      }
    ]
  },
  {
    "ad": "DAMLA SONGÜL",
    "soyad": "ÖZDABAĞ",
    "sinif": "11",
    "sube": "EA2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5468752828.0"
      },
      {
        "alan": "e_mail",
        "deger": "damlaozdabag6@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5304264972"
      }
    ]
  },
  {
    "ad": "DAMLANUR",
    "soyad": "YILMAZ",
    "sinif": "11",
    "sube": "SAY2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5010423144.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5439250944"
      }
    ]
  },
  {
    "ad": "DEFNE",
    "soyad": "ARIK",
    "sinif": "12",
    "sube": "TYT",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5519962723.0"
      },
      {
        "alan": "e_mail",
        "deger": "defnedefne1801@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5078567595"
      }
    ]
  },
  {
    "ad": "DEFNE",
    "soyad": "İŞLER",
    "sinif": "12",
    "sube": "EA2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5528194401.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5530636034"
      }
    ]
  },
  {
    "ad": "DENİZ",
    "soyad": "AKPINAR",
    "sinif": "12",
    "sube": "SAY2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5348362157.0"
      },
      {
        "alan": "e_mail",
        "deger": "akpinardeniz444@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5373767398"
      }
    ]
  },
  {
    "ad": "DENİZ",
    "soyad": "ÇATALTEPE",
    "sinif": "10",
    "sube": "nan",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5468525012.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5422064280"
      }
    ]
  },
  {
    "ad": "DENİZ CEMRE",
    "soyad": "AKTAŞ",
    "sinif": "MEZUN",
    "sube": "MEA1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5388908093.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5336907227"
      }
    ]
  },
  {
    "ad": "DİLA CEREN",
    "soyad": "UÇAN",
    "sinif": "12",
    "sube": "EA1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5465764436.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5396954436"
      }
    ]
  },
  {
    "ad": "DİLBER",
    "soyad": "KURBAN",
    "sinif": "MEZUN",
    "sube": "MEA3",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5013605875.0"
      },
      {
        "alan": "e_mail",
        "deger": "dilberkurban58@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5352428365"
      }
    ]
  },
  {
    "ad": "DORUK GÜNEY",
    "soyad": "GÖVTEPE",
    "sinif": "11",
    "sube": "SAY1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5422657958.0"
      },
      {
        "alan": "e_mail",
        "deger": "dgovtepe09@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5519354660"
      }
    ]
  },
  {
    "ad": "DURU",
    "soyad": "KAYA",
    "sinif": "11",
    "sube": "SAY1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5433952539.0"
      },
      {
        "alan": "e_mail",
        "deger": "58emos@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5338156105"
      }
    ]
  },
  {
    "ad": "DURU",
    "soyad": "YILDIZ",
    "sinif": "11",
    "sube": "SAY1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5360663462.0"
      },
      {
        "alan": "e_mail",
        "deger": "zvvk453@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5396235310"
      }
    ]
  },
  {
    "ad": "DURU",
    "soyad": "BALTACI",
    "sinif": "11",
    "sube": "SAY1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5510737428.0"
      },
      {
        "alan": "e_mail",
        "deger": "durubaltaci48@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5444792278"
      }
    ]
  },
  {
    "ad": "DÜZGÜN ALİ",
    "soyad": "YILDIZ",
    "sinif": "9",
    "sube": "nan",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5366583062.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5396235310"
      }
    ]
  },
  {
    "ad": "EBRAR",
    "soyad": "SARIASLAN",
    "sinif": "11",
    "sube": "EA1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5510096057.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5050763538"
      }
    ]
  },
  {
    "ad": "EBRAR",
    "soyad": "AKTAŞ",
    "sinif": "11",
    "sube": "EA2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5343697462.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5384880029"
      }
    ]
  },
  {
    "ad": "EBRAR",
    "soyad": "ÇETİN",
    "sinif": "12",
    "sube": "SAY3",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5303266757.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5378214754"
      }
    ]
  },
  {
    "ad": "EBRAR",
    "soyad": "BAYRAK",
    "sinif": "12",
    "sube": "EA3",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5310892670.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5310892670"
      }
    ]
  },
  {
    "ad": "EBRAR",
    "soyad": "ERGİN",
    "sinif": "9",
    "sube": "nan",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5521530110.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5436034075"
      }
    ]
  },
  {
    "ad": "ECEM DENİZ",
    "soyad": "UĞUR",
    "sinif": "MEZUN",
    "sube": "MEA3",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5365240410.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5327982491"
      }
    ]
  },
  {
    "ad": "ECENAZ",
    "soyad": "GERÇEK",
    "sinif": "MEZUN",
    "sube": "MEA2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5539057450.0"
      },
      {
        "alan": "e_mail",
        "deger": "ecenazgercek74@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5326889822"
      }
    ]
  },
  {
    "ad": "ECENUR",
    "soyad": "ÖZDEMİR",
    "sinif": "11",
    "sube": "SAY2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5518345952.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5518976532"
      }
    ]
  },
  {
    "ad": "ECRİN",
    "soyad": "YILMAZ",
    "sinif": "9",
    "sube": "nan",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5518551690.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5468289290"
      }
    ]
  },
  {
    "ad": "ECRİN",
    "soyad": "ATİK",
    "sinif": "12",
    "sube": "EA1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5468248152.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5376984693"
      }
    ]
  },
  {
    "ad": "ECRİN",
    "soyad": "ALTAY",
    "sinif": "11",
    "sube": "EA1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5519961915.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5512553784"
      }
    ]
  },
  {
    "ad": "ECRİN MELİS",
    "soyad": "ARSLAN",
    "sinif": "11",
    "sube": "EA2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5531759348.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5308116509"
      }
    ]
  },
  {
    "ad": "ECRİN NAZ",
    "soyad": "KAYA",
    "sinif": "11",
    "sube": "SAY1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5455730358.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5071555365"
      }
    ]
  },
  {
    "ad": "EDA",
    "soyad": "ESER",
    "sinif": "11",
    "sube": "SAY2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5511760049.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5435783665"
      }
    ]
  },
  {
    "ad": "EDA SELİN",
    "soyad": "BABACAN",
    "sinif": "11",
    "sube": "SAY1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5447292565.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5323210029"
      }
    ]
  },
  {
    "ad": "EFE",
    "soyad": "DEMİRAL",
    "sinif": "MEZUN",
    "sube": "MSAY1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5306463406.0"
      },
      {
        "alan": "e_mail",
        "deger": "def74605@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5418666548"
      }
    ]
  },
  {
    "ad": "EFE MELİH",
    "soyad": "CAN",
    "sinif": "MEZUN",
    "sube": "MSAY3",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5417165858.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5437605858\n5325203044"
      }
    ]
  },
  {
    "ad": "EFE NECİP",
    "soyad": "DOĞAN",
    "sinif": "12",
    "sube": "SAY2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5319452719.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5319409723"
      }
    ]
  },
  {
    "ad": "EFKAN",
    "soyad": "DAĞIDIR",
    "sinif": "12",
    "sube": "SAY1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5528381646.0"
      },
      {
        "alan": "e_mail",
        "deger": "dagidirefkan18@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5532555245"
      }
    ]
  },
  {
    "ad": "EFLİN",
    "soyad": "EROĞLU",
    "sinif": "11",
    "sube": "SAY2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5323835193.0"
      },
      {
        "alan": "e_mail",
        "deger": "ayseeroglu@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5074899327"
      }
    ]
  },
  {
    "ad": "EFTELYA",
    "soyad": "GÜZEL",
    "sinif": "9",
    "sube": "nan",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5323643945.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5334188380"
      }
    ]
  },
  {
    "ad": "EGE",
    "soyad": "TOPÇU",
    "sinif": "MEZUN",
    "sube": "MSAY1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5528500324.0"
      },
      {
        "alan": "e_mail",
        "deger": "egeasaf1905@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5335684420"
      }
    ]
  },
  {
    "ad": "EGE URAS",
    "soyad": "ŞAHİN",
    "sinif": "12",
    "sube": "EA2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5455172747.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5522611677"
      }
    ]
  },
  {
    "ad": "EKİN",
    "soyad": "ŞENSOY",
    "sinif": "12",
    "sube": "SAY3",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5525431623.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5521029237"
      }
    ]
  },
  {
    "ad": "ELA",
    "soyad": "ÇENGEL",
    "sinif": "MEZUN",
    "sube": "MEA2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5457434110.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5448445790"
      }
    ]
  },
  {
    "ad": "ELA",
    "soyad": "KAHRAMANOĞLU",
    "sinif": "12",
    "sube": "SAY1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5514071918.0"
      },
      {
        "alan": "e_mail",
        "deger": "elakhr08@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5366836200"
      }
    ]
  },
  {
    "ad": "ELA",
    "soyad": "ÇOBAN",
    "sinif": "11",
    "sube": "SAY1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5305880608.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5359486538"
      }
    ]
  },
  {
    "ad": "ELANUR",
    "soyad": "ÇAKA",
    "sinif": "12",
    "sube": "SAY2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5421700043.0"
      },
      {
        "alan": "e_mail",
        "deger": "cakae52@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5352079695"
      }
    ]
  },
  {
    "ad": "ELANUR",
    "soyad": "TAŞKESEN",
    "sinif": "MEZUN",
    "sube": "MSAY3",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5538117067.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5379425347"
      }
    ]
  },
  {
    "ad": "ELİF",
    "soyad": "YİĞİT",
    "sinif": "MEZUN",
    "sube": "MEA3",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5454604480.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5516364435"
      }
    ]
  },
  {
    "ad": "ELİF",
    "soyad": "GÜRER",
    "sinif": "MEZUN",
    "sube": "MSAY3",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5523789429.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5395722873"
      }
    ]
  },
  {
    "ad": "ELİF",
    "soyad": "BOYRAZ",
    "sinif": "12",
    "sube": "EA3",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5524657944.0"
      },
      {
        "alan": "e_mail",
        "deger": "boyrazelif18@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5322027831"
      }
    ]
  },
  {
    "ad": "ELİF",
    "soyad": "ERSOY",
    "sinif": "11",
    "sube": "SAY2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5325609461.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5352592384"
      }
    ]
  },
  {
    "ad": "ELİF",
    "soyad": "TURANTEPE",
    "sinif": "11",
    "sube": "SAY1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5446203562.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5368823773"
      }
    ]
  },
  {
    "ad": "ELİF",
    "soyad": "ACISU",
    "sinif": "10",
    "sube": "nan",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5464522726.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5364522726"
      }
    ]
  },
  {
    "ad": "ELİF BEYZA",
    "soyad": "ŞİMŞEK",
    "sinif": "MEZUN",
    "sube": "MEA3",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5352652923.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5511699202"
      }
    ]
  },
  {
    "ad": "ELİF İREM",
    "soyad": "AVCU",
    "sinif": "MEZUN",
    "sube": "MSAY1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5459746880.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5358605533"
      }
    ]
  },
  {
    "ad": "ELİF NAZ",
    "soyad": "ERDOĞAN",
    "sinif": "12",
    "sube": "SAY1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5451452704.0"
      },
      {
        "alan": "e_mail",
        "deger": "elifnazerdogan04@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5415219434"
      }
    ]
  },
  {
    "ad": "ELİF NAZ",
    "soyad": "DURAN",
    "sinif": "MEZUN",
    "sube": "MEA2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5309395290.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5337451631"
      }
    ]
  },
  {
    "ad": "ELİF NUR",
    "soyad": "KAYA",
    "sinif": "12",
    "sube": "EA2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5416545023.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5336606423"
      }
    ]
  },
  {
    "ad": "ELİF SENA",
    "soyad": "ODABAŞI",
    "sinif": "MEZUN",
    "sube": "TYT",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5342108404.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5333835514"
      }
    ]
  },
  {
    "ad": "ELİF SU",
    "soyad": "TAŞ",
    "sinif": "12",
    "sube": "EA1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5447733443.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5375737626"
      }
    ]
  },
  {
    "ad": "EMİN",
    "soyad": "DUDU",
    "sinif": "11",
    "sube": "EA2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5358242618.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5374309014"
      }
    ]
  },
  {
    "ad": "EMİNE",
    "soyad": "KANSIZ",
    "sinif": "11",
    "sube": "SAY2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5510208181.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5072265549"
      }
    ]
  },
  {
    "ad": "EMİNE",
    "soyad": "ERDOĞAN",
    "sinif": "12",
    "sube": "EA2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5314728681.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5393826785"
      }
    ]
  },
  {
    "ad": "EMİNE NİSA",
    "soyad": "ŞEREF",
    "sinif": "12",
    "sube": "EA2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5425494892.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5465494892"
      }
    ]
  },
  {
    "ad": "EMİNE ŞULE",
    "soyad": "YORGANCI",
    "sinif": "MEZUN",
    "sube": "TYT",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5523135380.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5071555380"
      }
    ]
  },
  {
    "ad": "EMİRHAN",
    "soyad": "PENEK",
    "sinif": "12",
    "sube": "SAY2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5308280839.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5325010839"
      }
    ]
  },
  {
    "ad": "EMİRHAN",
    "soyad": "TÜRKMEN",
    "sinif": "12",
    "sube": "SAY3",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5383317550.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5378610074"
      }
    ]
  },
  {
    "ad": "EMİRHAN",
    "soyad": "KESKİN",
    "sinif": "12",
    "sube": "SAY3",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5516498052.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5353603602"
      }
    ]
  },
  {
    "ad": "EMRE ERTOK",
    "soyad": "GÜZEL",
    "sinif": "12",
    "sube": "SAY3",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5309055342.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5073113272"
      }
    ]
  },
  {
    "ad": "EMRE UMUT",
    "soyad": "SAĞLAM",
    "sinif": "11",
    "sube": "EA2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5464398568.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5424938563"
      }
    ]
  },
  {
    "ad": "ENES",
    "soyad": "İŞLER",
    "sinif": "10",
    "sube": "nan",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5541636034.0"
      },
      {
        "alan": "e_mail",
        "deger": "enesisler10@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5368194400"
      }
    ]
  },
  {
    "ad": "ENES",
    "soyad": "VARIŞ",
    "sinif": "12",
    "sube": "EA3",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5358142836.0"
      },
      {
        "alan": "e_mail",
        "deger": "varisenes36@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5366252715"
      }
    ]
  },
  {
    "ad": "ENES İNANÇ",
    "soyad": "GÖKBULUT",
    "sinif": "12",
    "sube": "EA3",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5349605330.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5379305330"
      }
    ]
  },
  {
    "ad": "ENES KAYRA",
    "soyad": "VARGÜN",
    "sinif": "12",
    "sube": "EA2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5519555622.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5372515091"
      }
    ]
  },
  {
    "ad": "ENES TUĞRA",
    "soyad": "ATAN",
    "sinif": "12",
    "sube": "SAY3",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5510188900.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5374686860"
      }
    ]
  },
  {
    "ad": "EREN",
    "soyad": "ALTUNSU",
    "sinif": "11",
    "sube": "SAY2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5510192929.0"
      },
      {
        "alan": "e_mail",
        "deger": "erenaltunsu89@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5357754546"
      }
    ]
  },
  {
    "ad": "EREN",
    "soyad": "ÖZBUZCİ",
    "sinif": "12",
    "sube": "SAY2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5442486698.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5326412940"
      }
    ]
  },
  {
    "ad": "EREN",
    "soyad": "ARTUÇ",
    "sinif": "9",
    "sube": "nan",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5422851082.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5012111231"
      }
    ]
  },
  {
    "ad": "ERENCAN",
    "soyad": "KARABAŞ",
    "sinif": "MEZUN",
    "sube": "MEA2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5414761305.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5343010602"
      }
    ]
  },
  {
    "ad": "ESMA",
    "soyad": "YAVUZ",
    "sinif": "12",
    "sube": "EA1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5356882561.0"
      },
      {
        "alan": "e_mail",
        "deger": "esma.yvz.2561@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5359443061"
      }
    ]
  },
  {
    "ad": "ESMA",
    "soyad": "GÜNHAN",
    "sinif": "12",
    "sube": "SAY1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5344858076.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5362304076"
      }
    ]
  },
  {
    "ad": "ESMANUR",
    "soyad": "YÜKSEK",
    "sinif": "11",
    "sube": "EA1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5524503728.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5315767231"
      }
    ]
  },
  {
    "ad": "ESRA",
    "soyad": "KOÇ",
    "sinif": "11",
    "sube": "EA1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5541052748.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5511931503"
      }
    ]
  },
  {
    "ad": "EYLÜL NİSA",
    "soyad": "YUTAR",
    "sinif": "12",
    "sube": "EA1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5327438426.0"
      },
      {
        "alan": "e_mail",
        "deger": "nisayutar@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5054897356"
      }
    ]
  },
  {
    "ad": "EYMEN",
    "soyad": "ÜNVER",
    "sinif": "12",
    "sube": "SAY1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5423048609.0"
      },
      {
        "alan": "e_mail",
        "deger": "eymenunver1903@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5052250855"
      }
    ]
  },
  {
    "ad": "EYMEN CEM",
    "soyad": "ERDAL",
    "sinif": "11",
    "sube": "SAY1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5444462811.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5347836657"
      }
    ]
  },
  {
    "ad": "EYÜP",
    "soyad": "ACAR",
    "sinif": "12",
    "sube": "SAY3",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5359246055.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5368969712"
      }
    ]
  },
  {
    "ad": "EZGİ ECRİN",
    "soyad": "TELLİ",
    "sinif": "12",
    "sube": "EA2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5510200434.0"
      },
      {
        "alan": "e_mail",
        "deger": "ecrintelli08@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5453035997"
      }
    ]
  },
  {
    "ad": "FARUK",
    "soyad": "GENÇEL",
    "sinif": "11",
    "sube": "EA2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5518373581.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5375449381"
      }
    ]
  },
  {
    "ad": "FARUK KAYA",
    "soyad": "TEKİN",
    "sinif": "12",
    "sube": "SAY1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5551457850.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5337137850"
      }
    ]
  },
  {
    "ad": "FATIMA ZEHRA",
    "soyad": "AYDIN",
    "sinif": "MEZUN",
    "sube": "MEA3",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5556367158.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5558669458"
      }
    ]
  },
  {
    "ad": "FATİH",
    "soyad": "GÜNAYDIN",
    "sinif": "12",
    "sube": "EA1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5393691328.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5359660613"
      }
    ]
  },
  {
    "ad": "FATMA BERRA",
    "soyad": "KARADENİZ",
    "sinif": "11",
    "sube": "SAY2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5525457743.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5549597741"
      }
    ]
  },
  {
    "ad": "FATMA ECRİN",
    "soyad": "KAYA",
    "sinif": "11",
    "sube": "SAY2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5528689493.0"
      },
      {
        "alan": "e_mail",
        "deger": "fatmaecrin3444@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5326665064"
      }
    ]
  },
  {
    "ad": "FATMANUR",
    "soyad": "ÇAKIR",
    "sinif": "MEZUN",
    "sube": "MSAY3",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5350473669.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5322532057"
      }
    ]
  },
  {
    "ad": "FAZLI",
    "soyad": "ŞEKERCİOĞLU",
    "sinif": "12",
    "sube": "EA3",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5334043708.0"
      },
      {
        "alan": "e_mail",
        "deger": "fazliseker80@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5539832882"
      }
    ]
  },
  {
    "ad": "FERZAN",
    "soyad": "ALTINARI",
    "sinif": "11",
    "sube": "EA2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5305965709.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5058311883"
      }
    ]
  },
  {
    "ad": "FIRAT",
    "soyad": "ÖZESER",
    "sinif": "12",
    "sube": "EA2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5352230051.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5362970051"
      }
    ]
  },
  {
    "ad": "FİRDEVS TUANA",
    "soyad": "BOY",
    "sinif": "12",
    "sube": "EA3",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5523141224.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5418638423"
      }
    ]
  },
  {
    "ad": "FULDE DEVA",
    "soyad": "YILDIRIM",
    "sinif": "12",
    "sube": "TYT",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5455200334.0"
      },
      {
        "alan": "e_mail",
        "deger": "fuldeva@icloud.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5315155709"
      }
    ]
  },
  {
    "ad": "FURKAN",
    "soyad": "VARGÜN",
    "sinif": "11",
    "sube": "EA1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5516911408.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5372515091"
      }
    ]
  },
  {
    "ad": "GAMZE REYYAN",
    "soyad": "POLAT",
    "sinif": "MEZUN",
    "sube": "MEA1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5538090751.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5316807782"
      }
    ]
  },
  {
    "ad": "GÖRKEM EFE",
    "soyad": "ÖZKÖK",
    "sinif": "MEZUN",
    "sube": "TYT",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5550778915.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5545861255"
      }
    ]
  },
  {
    "ad": "GÖZDE",
    "soyad": "YÜCE",
    "sinif": "10",
    "sube": "nan",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5510683516.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5349281566"
      }
    ]
  },
  {
    "ad": "GÜLBAHAR",
    "soyad": "PİRBUDAK",
    "sinif": "12",
    "sube": "EA3",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5452251924.0"
      },
      {
        "alan": "e_mail",
        "deger": "gulbaharrr721@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5445351403"
      }
    ]
  },
  {
    "ad": "GÜLÇİN",
    "soyad": "BİÇAKÇI",
    "sinif": "MEZUN",
    "sube": "MEA2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5432724414.0"
      },
      {
        "alan": "e_mail",
        "deger": "bicakcigulcin324@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5353715007"
      }
    ]
  },
  {
    "ad": "GÜLİZ",
    "soyad": "ÖZKAN",
    "sinif": "MEZUN",
    "sube": "MSAY2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5498144201.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5354663945"
      }
    ]
  },
  {
    "ad": "GÜLŞAH",
    "soyad": "KAYA",
    "sinif": "MEZUN",
    "sube": "TYT",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5538674220.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5332168138"
      }
    ]
  },
  {
    "ad": "GÜNEY",
    "soyad": "POLAT",
    "sinif": "11",
    "sube": "SAY2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5335902672.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5349267777"
      }
    ]
  },
  {
    "ad": "HAFİZE ELA",
    "soyad": "KUZULUK",
    "sinif": "MEZUN",
    "sube": "MEA3",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5528308436.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5428231330"
      }
    ]
  },
  {
    "ad": "HAKTAN",
    "soyad": "YILDIRIM",
    "sinif": "12",
    "sube": "EA3",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5427406504.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5357240317"
      }
    ]
  },
  {
    "ad": "HALİL EFE",
    "soyad": "YILDIRIM",
    "sinif": "11",
    "sube": "SAY1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5422368076.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5447229564"
      }
    ]
  },
  {
    "ad": "HAMZA POYRAZ",
    "soyad": "KAYA",
    "sinif": "11",
    "sube": "SAY1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5365815458.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5300729283"
      }
    ]
  },
  {
    "ad": "HANİM ELİF",
    "soyad": "ÇELİK",
    "sinif": "12",
    "sube": "EA2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5527489218.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5539431689"
      }
    ]
  },
  {
    "ad": "HASAN",
    "soyad": "ŞAHBAZ",
    "sinif": "MEZUN",
    "sube": "MSAY1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5526823466.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5374648566"
      }
    ]
  },
  {
    "ad": "HASAN",
    "soyad": "MENTEŞ",
    "sinif": "MEZUN",
    "sube": "MSAY1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5528710096.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5368798562"
      }
    ]
  },
  {
    "ad": "HASAN HÜSEYİN",
    "soyad": "FAZLIOĞLU",
    "sinif": "MEZUN",
    "sube": "MSAY1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5411868560.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5353533550"
      }
    ]
  },
  {
    "ad": "HASAN TAHA",
    "soyad": "ÖZKAN",
    "sinif": "MEZUN",
    "sube": "MSAY1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5550212900.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5415141212"
      }
    ]
  },
  {
    "ad": "HAVİN",
    "soyad": "AKÇİLAD",
    "sinif": "12",
    "sube": "EA3",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5318558636.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5516680664"
      }
    ]
  },
  {
    "ad": "HAVİN",
    "soyad": "ŞENSOY",
    "sinif": "12",
    "sube": "SAY3",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5526455078.0"
      },
      {
        "alan": "e_mail",
        "deger": "berfinsensoy@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5521029237"
      }
    ]
  },
  {
    "ad": "HAYAL NAZ",
    "soyad": "SİVASLIO",
    "sinif": "MEZUN",
    "sube": "TYT",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5305039623.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5359298774"
      }
    ]
  },
  {
    "ad": "HAYRUNİSA",
    "soyad": "YILDIRIM",
    "sinif": "12",
    "sube": "SAY2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5516804992.0"
      },
      {
        "alan": "e_mail",
        "deger": "yhayrunisa03@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5343916020"
      }
    ]
  },
  {
    "ad": "HAYRUNİSA",
    "soyad": "AŞKIN",
    "sinif": "MEZUN",
    "sube": "MEA1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5380726502.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5369879527"
      }
    ]
  },
  {
    "ad": "HİLAL",
    "soyad": "AKÇA",
    "sinif": "MEZUN",
    "sube": "MEA2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5447629983.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5462961198"
      }
    ]
  },
  {
    "ad": "HİLAL",
    "soyad": "VAROL",
    "sinif": "MEZUN",
    "sube": "MEA2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5079523460.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5061236560"
      }
    ]
  },
  {
    "ad": "HÜSEYİN",
    "soyad": "TÜRKYILMAZ",
    "sinif": "11",
    "sube": "SAY1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5510884342.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5375746942"
      }
    ]
  },
  {
    "ad": "HÜSEYİN GÖRKEM",
    "soyad": "PINARBAŞI",
    "sinif": "12",
    "sube": "SAY1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5437140558.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5374836042"
      }
    ]
  },
  {
    "ad": "IRMAK",
    "soyad": "ÖZCAN",
    "sinif": "12",
    "sube": "EA1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5368263495.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5437363495"
      }
    ]
  },
  {
    "ad": "IRMAK",
    "soyad": "KILIÇ",
    "sinif": "MEZUN",
    "sube": "MEA3",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5308161489.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5398351927"
      }
    ]
  },
  {
    "ad": "IŞIL CANSU",
    "soyad": "GELİR",
    "sinif": "MEZUN",
    "sube": "MSAY1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5300967844.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5447987044"
      }
    ]
  },
  {
    "ad": "İBRAHİM EFE",
    "soyad": "KUZUCU",
    "sinif": "MEZUN",
    "sube": "MSAY2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5334753786.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5352789809"
      }
    ]
  },
  {
    "ad": "İLAYDA",
    "soyad": "SEVEN",
    "sinif": "MEZUN",
    "sube": "MSAY3",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5050181336.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5050204708"
      }
    ]
  },
  {
    "ad": "İLAYDA",
    "soyad": "KARADUMAN",
    "sinif": "12",
    "sube": "EA2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5537660978.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5313501548"
      }
    ]
  },
  {
    "ad": "İLAYDA CEMRE",
    "soyad": "SONSES",
    "sinif": "11",
    "sube": "SAY2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5013735451.0"
      },
      {
        "alan": "e_mail",
        "deger": "ilaydacemresonses@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5434205455"
      }
    ]
  },
  {
    "ad": "İLKER BEYAZIT",
    "soyad": "ORUÇ",
    "sinif": "12",
    "sube": "SAY1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5550317435.0"
      },
      {
        "alan": "e_mail",
        "deger": "ilkerbeyazito@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5014440795"
      }
    ]
  },
  {
    "ad": "İLKNUR",
    "soyad": "KILIÇ",
    "sinif": "12",
    "sube": "EA3",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5469453089.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5446268902"
      }
    ]
  },
  {
    "ad": "İLKNUR",
    "soyad": "BALCI",
    "sinif": "MEZUN",
    "sube": "MEA1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5527556192.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5459458720"
      }
    ]
  },
  {
    "ad": "İPEK GÜLAY",
    "soyad": "DOĞAN",
    "sinif": "MEZUN",
    "sube": "MSAY3",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5372037474.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5356687676"
      }
    ]
  },
  {
    "ad": "İPEKSU",
    "soyad": "AKSOY",
    "sinif": "11",
    "sube": "SAY2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5416607770.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5434916460"
      }
    ]
  },
  {
    "ad": "İREM",
    "soyad": "SARICA",
    "sinif": "12",
    "sube": "EA1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5461293919.0"
      },
      {
        "alan": "e_mail",
        "deger": "isarica42@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5375011919"
      }
    ]
  },
  {
    "ad": "İREM",
    "soyad": "AŞLAK",
    "sinif": "12",
    "sube": "TYT",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5347114318.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5388740018"
      }
    ]
  },
  {
    "ad": "İREM DÖNDÜ",
    "soyad": "DOĞAN",
    "sinif": "12",
    "sube": "SAY1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5459047531.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5374671000"
      }
    ]
  },
  {
    "ad": "İREM HATİCE",
    "soyad": "İHTİYAR",
    "sinif": "11",
    "sube": "SAY2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5431992757.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5443459553"
      }
    ]
  },
  {
    "ad": "İREM NAZ",
    "soyad": "AKIN",
    "sinif": "MEZUN",
    "sube": "MSAY2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5428254828.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5436138873"
      }
    ]
  },
  {
    "ad": "İZGİNUR",
    "soyad": "HANCIOĞLU",
    "sinif": "MEZUN",
    "sube": "MSAY1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5536991127.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5332537605"
      }
    ]
  },
  {
    "ad": "KAAN YUSUF",
    "soyad": "KAYA",
    "sinif": "MEZUN",
    "sube": "MSAY2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5362029258.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5300729283"
      }
    ]
  },
  {
    "ad": "KAĞAN",
    "soyad": "TOPAL",
    "sinif": "9",
    "sube": "nan",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5309974915.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5445199801"
      }
    ]
  },
  {
    "ad": "KEMAL",
    "soyad": "KESKİNLER",
    "sinif": "MEZUN",
    "sube": "MEA1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5394843409.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5365913372"
      }
    ]
  },
  {
    "ad": "KEREM ESER",
    "soyad": "TARI",
    "sinif": "MEZUN",
    "sube": "MSAY2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5309594977.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5307207049"
      }
    ]
  },
  {
    "ad": "KERİM",
    "soyad": "KARADUMAN",
    "sinif": "MEZUN",
    "sube": "MEA1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5418237855.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5334692880"
      }
    ]
  },
  {
    "ad": "KERİM",
    "soyad": "ÇOLAK",
    "sinif": "MEZUN",
    "sube": "MSAY1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5525013828.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5077694204"
      }
    ]
  },
  {
    "ad": "KEZBAN ELİF",
    "soyad": "FİLİZ",
    "sinif": "10",
    "sube": "nan",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5074532719.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5342188688"
      }
    ]
  },
  {
    "ad": "KEZİBAN",
    "soyad": "URHAN",
    "sinif": "MEZUN",
    "sube": "MEA3",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5347618858.0"
      },
      {
        "alan": "e_mail",
        "deger": "kezbanurhan9@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5458969566"
      }
    ]
  },
  {
    "ad": "KÜBRA NUR",
    "soyad": "ALKAN",
    "sinif": "MEZUN",
    "sube": "MEA2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5525657037.0"
      },
      {
        "alan": "e_mail",
        "deger": "kubranurlkn@gmail.gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5368237958"
      }
    ]
  },
  {
    "ad": "LARA",
    "soyad": "TEZKOŞAR",
    "sinif": "11",
    "sube": "SAY1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5526256230.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5444302640"
      }
    ]
  },
  {
    "ad": "MEDİNE",
    "soyad": "ÇETİN",
    "sinif": "MEZUN",
    "sube": "TYT",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5302478558.0"
      },
      {
        "alan": "e_mail",
        "deger": "medo7cetin1234@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5424992407"
      }
    ]
  },
  {
    "ad": "MEDİNE",
    "soyad": "BOZ",
    "sinif": "MEZUN",
    "sube": "MEA2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5394593926.0"
      },
      {
        "alan": "e_mail",
        "deger": "medolote@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5325775477"
      }
    ]
  },
  {
    "ad": "MEDİNE YAĞMUR",
    "soyad": "ÖDEMİŞOĞLU",
    "sinif": "MEZUN",
    "sube": "MSAY2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5424078542.0"
      },
      {
        "alan": "e_mail",
        "deger": "odemisogluyagmur@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5468616306"
      }
    ]
  },
  {
    "ad": "MEHMET AKİF",
    "soyad": "KELEŞOĞLU",
    "sinif": "11",
    "sube": "EA2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5515369380.0"
      },
      {
        "alan": "e_mail",
        "deger": "makifkls25@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5439264425"
      }
    ]
  },
  {
    "ad": "MEHMET FATİH",
    "soyad": "TANRIVER",
    "sinif": "MEZUN",
    "sube": "MSAY1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5523542461.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5358981742"
      }
    ]
  },
  {
    "ad": "MEHMET TALİP",
    "soyad": "PEKER",
    "sinif": "12",
    "sube": "SAY2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5522863451.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5412903258"
      }
    ]
  },
  {
    "ad": "MELEK",
    "soyad": "ŞENELEN",
    "sinif": "10",
    "sube": "nan",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5352162518.0"
      },
      {
        "alan": "e_mail",
        "deger": "senelenmelek12@icloud.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5324052518"
      }
    ]
  },
  {
    "ad": "MELİKE",
    "soyad": "GÜLMEZ",
    "sinif": "12",
    "sube": "SAY2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5345050877.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5358854247"
      }
    ]
  },
  {
    "ad": "MELİKE",
    "soyad": "KONT",
    "sinif": "11",
    "sube": "EA1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5396833653.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5343152096"
      }
    ]
  },
  {
    "ad": "MELİKE",
    "soyad": "YILDIRIM",
    "sinif": "MEZUN",
    "sube": "MSAY2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5539715358.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5359683007"
      }
    ]
  },
  {
    "ad": "MERDAN ARMAĞAN",
    "soyad": "ÇALIŞKAN",
    "sinif": "12",
    "sube": "SAY2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5320159958.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5326954058"
      }
    ]
  },
  {
    "ad": "MERT",
    "soyad": "ASLANOĞLU",
    "sinif": "10",
    "sube": "nan",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5528202219.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5072381647"
      }
    ]
  },
  {
    "ad": "MERT ALİ",
    "soyad": "ALTAŞ",
    "sinif": "12",
    "sube": "SAY2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5523979257.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5378698997"
      }
    ]
  },
  {
    "ad": "MERT ATAKAN",
    "soyad": "KAYGUSUZ",
    "sinif": "MEZUN",
    "sube": "MSAY2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5397303324.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5383266403"
      }
    ]
  },
  {
    "ad": "MERVE",
    "soyad": "YILMAZ",
    "sinif": "MEZUN",
    "sube": "TYT",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5519688793.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5388681189"
      }
    ]
  },
  {
    "ad": "MERVE BETÜL",
    "soyad": "DÖNMEZ",
    "sinif": "12",
    "sube": "SAY1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5550731363.0"
      },
      {
        "alan": "e_mail",
        "deger": "donmezmervebetul@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5352918012"
      }
    ]
  },
  {
    "ad": "MERVE DENİZ",
    "soyad": "ARICAN",
    "sinif": "12",
    "sube": "SAY2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5078701451.0"
      },
      {
        "alan": "e_mail",
        "deger": "aricanmervedeniz@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5354651870"
      }
    ]
  },
  {
    "ad": "MERYEM NUR",
    "soyad": "ÖZDEMİR",
    "sinif": "11",
    "sube": "SAY1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5519603322.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5396764011"
      }
    ]
  },
  {
    "ad": "METİN YİĞİT",
    "soyad": "AKÇA",
    "sinif": "12",
    "sube": "EA3",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5388722708.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5333365770"
      }
    ]
  },
  {
    "ad": "MİNA",
    "soyad": "SERDAR",
    "sinif": "11",
    "sube": "SAY2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5375163461.0"
      },
      {
        "alan": "e_mail",
        "deger": "minaserdar3@gmal.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5368566065"
      }
    ]
  },
  {
    "ad": "MİNA",
    "soyad": "DEMİREL",
    "sinif": "MEZUN",
    "sube": "MSAY2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5446907057.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5426585685"
      }
    ]
  },
  {
    "ad": "MUHAMMED",
    "soyad": "KAPTAN",
    "sinif": "11",
    "sube": "SAY2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5524631356.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5058764720"
      }
    ]
  },
  {
    "ad": "MUHAMMED ALİ",
    "soyad": "ÇAKIR",
    "sinif": "11",
    "sube": "EA2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5530513088.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5555619645"
      }
    ]
  },
  {
    "ad": "MUHAMMED BATUHAN",
    "soyad": "ECE",
    "sinif": "12",
    "sube": "SAY1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5433432908.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5434112190"
      }
    ]
  },
  {
    "ad": "MUHAMMED EMİN",
    "soyad": "HALICI",
    "sinif": "MEZUN",
    "sube": "MSAY2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5343260270.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5358816203"
      }
    ]
  },
  {
    "ad": "MUHAMMED EREN",
    "soyad": "BAÇ",
    "sinif": "12",
    "sube": "EA3",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5380352082.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5357222074"
      }
    ]
  },
  {
    "ad": "MUHAMMED ONUR",
    "soyad": "ÇAKMAK",
    "sinif": "12",
    "sube": "EA1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5510435788.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5363946489"
      }
    ]
  },
  {
    "ad": "MUHAMMET EMİN",
    "soyad": "KAYMAZ",
    "sinif": "MEZUN",
    "sube": "MSAY2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5443744419.0"
      },
      {
        "alan": "e_mail",
        "deger": "muhammet.ekaymaz@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5054182163"
      }
    ]
  },
  {
    "ad": "MUSTAFA",
    "soyad": "AYDIN",
    "sinif": "12",
    "sube": "EA2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5518891338.0"
      },
      {
        "alan": "e_mail",
        "deger": "mustafa1841818@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5345222318"
      }
    ]
  },
  {
    "ad": "MUSTAFA YİĞİT",
    "soyad": "AKMAN",
    "sinif": "MEZUN",
    "sube": "MSAY3",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5051119924.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5353723595"
      }
    ]
  },
  {
    "ad": "NAZ",
    "soyad": "BAKIŞLI",
    "sinif": "12",
    "sube": "EA1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5516510677.0"
      },
      {
        "alan": "e_mail",
        "deger": "nazbakisli@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5373219188"
      }
    ]
  },
  {
    "ad": "NAZ SELİN",
    "soyad": "SATUK",
    "sinif": "12",
    "sube": "EA2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5346540468.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5353259925"
      }
    ]
  },
  {
    "ad": "NEBİ KAYRA",
    "soyad": "BAŞKAN",
    "sinif": "12",
    "sube": "EA1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5431070712.0"
      },
      {
        "alan": "e_mail",
        "deger": "kheylphs@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5412708595"
      }
    ]
  },
  {
    "ad": "NEDİM ETKA",
    "soyad": "BAL",
    "sinif": "MEZUN",
    "sube": "MSAY1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5436693938.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5356422867"
      }
    ]
  },
  {
    "ad": "NEHİR",
    "soyad": "YAĞCI",
    "sinif": "12",
    "sube": "TYT",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5373627783.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5350271416"
      }
    ]
  },
  {
    "ad": "NEHİR HAYAT",
    "soyad": "ÇETİN",
    "sinif": "11",
    "sube": "SAY2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5516798782.0"
      },
      {
        "alan": "e_mail",
        "deger": "nehircetin52@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5396882087"
      }
    ]
  },
  {
    "ad": "NESLİHAN",
    "soyad": "KAHRAMAN",
    "sinif": "12",
    "sube": "EA1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5431636678.0"
      },
      {
        "alan": "e_mail",
        "deger": "nisakhrmn560@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5392189489"
      }
    ]
  },
  {
    "ad": "NEZİHE CEREN",
    "soyad": "MERALER",
    "sinif": "12",
    "sube": "EA2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5467714734.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5352013737"
      }
    ]
  },
  {
    "ad": "NİDANUR",
    "soyad": "KUŞ",
    "sinif": "MEZUN",
    "sube": "MSAY3",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5362349852.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5392385557"
      }
    ]
  },
  {
    "ad": "NİHAT TALİP",
    "soyad": "KARCI",
    "sinif": "12",
    "sube": "EA3",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5050275583.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5058442642"
      }
    ]
  },
  {
    "ad": "NİL",
    "soyad": "YILMAZ",
    "sinif": "11",
    "sube": "SAY2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5010953561.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5546509593"
      }
    ]
  },
  {
    "ad": "NİLSU",
    "soyad": "ŞEN",
    "sinif": "12",
    "sube": "TYT",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5511938638.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5054563682"
      }
    ]
  },
  {
    "ad": "NİSA",
    "soyad": "UĞUR",
    "sinif": "11",
    "sube": "EA1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5516373417.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5378112385"
      }
    ]
  },
  {
    "ad": "NİSA",
    "soyad": "CEYLAN",
    "sinif": "11",
    "sube": "EA2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5518216905.0"
      },
      {
        "alan": "e_mail",
        "deger": "05nisa.ceylan@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5466340205"
      }
    ]
  },
  {
    "ad": "NİSA CEYDA",
    "soyad": "ŞAHİNGÖZ",
    "sinif": "MEZUN",
    "sube": "MEA2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5313413372.0"
      },
      {
        "alan": "e_mail",
        "deger": "nisaceydasahingoz6@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5465645317"
      }
    ]
  },
  {
    "ad": "NİSA NUR",
    "soyad": "TURAN",
    "sinif": "12",
    "sube": "EA3",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5521209424.0"
      },
      {
        "alan": "e_mail",
        "deger": "turannianur02@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5346546822"
      }
    ]
  },
  {
    "ad": "NİSA NUR",
    "soyad": "DAMAR",
    "sinif": "11",
    "sube": "SAY2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5422850424.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5309388789"
      }
    ]
  },
  {
    "ad": "NİSA NUR",
    "soyad": "ÖZTÜRK",
    "sinif": "11",
    "sube": "EA2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5013599089.0"
      },
      {
        "alan": "e_mail",
        "deger": "nisanurozturk@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5353588090"
      }
    ]
  },
  {
    "ad": "NİSANUR",
    "soyad": "SAVAŞ",
    "sinif": "11",
    "sube": "EA1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5395920557.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5427363326"
      }
    ]
  },
  {
    "ad": "NİSANUR",
    "soyad": "BOYACI",
    "sinif": "MEZUN",
    "sube": "TYT",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5411820074.0"
      },
      {
        "alan": "e_mail",
        "deger": "boyacinisanur44@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5530895836"
      }
    ]
  },
  {
    "ad": "NİSANUR",
    "soyad": "KARABURUN",
    "sinif": "12",
    "sube": "SAY3",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5412073687.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5416916269"
      }
    ]
  },
  {
    "ad": "NİSANUR",
    "soyad": "AYDIN",
    "sinif": "12",
    "sube": "SAY1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5516908226.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5397436178"
      }
    ]
  },
  {
    "ad": "NİZAMETTİN EFE",
    "soyad": "DURMUŞ",
    "sinif": "12",
    "sube": "SAY2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5315927061.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5368426161"
      }
    ]
  },
  {
    "ad": "NUMAN UMUT",
    "soyad": "ULUÇAY",
    "sinif": "12",
    "sube": "EA1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5422345178.0"
      },
      {
        "alan": "e_mail",
        "deger": "umutqyulucay@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5531476662"
      }
    ]
  },
  {
    "ad": "OĞUZ KAAN",
    "soyad": "CANKAYA",
    "sinif": "11",
    "sube": "SAY1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5523306424.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5068517020"
      }
    ]
  },
  {
    "ad": "ONUR",
    "soyad": "ŞEN",
    "sinif": "12",
    "sube": "SAY1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5051695562.0"
      },
      {
        "alan": "e_mail",
        "deger": "onur25065@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5055774081"
      }
    ]
  },
  {
    "ad": "ORHAN ASAF",
    "soyad": "ACAR",
    "sinif": "11",
    "sube": "SAY1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5079729618.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5061205153"
      }
    ]
  },
  {
    "ad": "OSMAN TARIK",
    "soyad": "KARADAŞ",
    "sinif": "12",
    "sube": "EA3",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5516570900.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5428081004"
      }
    ]
  },
  {
    "ad": "ÖMER",
    "soyad": "GENÇEL",
    "sinif": "11",
    "sube": "EA1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5518446661.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5375449381"
      }
    ]
  },
  {
    "ad": "ÖMER FARUK",
    "soyad": "ÇAM",
    "sinif": "12",
    "sube": "SAY3",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5554925959.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5539797350"
      }
    ]
  },
  {
    "ad": "ÖZGE",
    "soyad": "GÖKAY",
    "sinif": "12",
    "sube": "TYT",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5347364890.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5312208209"
      }
    ]
  },
  {
    "ad": "ÖZNUR",
    "soyad": "AYIRKAN",
    "sinif": "12",
    "sube": "EA2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5527533604.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5346623904"
      }
    ]
  },
  {
    "ad": "POYRAZ EFE",
    "soyad": "KIRCA",
    "sinif": "MEZUN",
    "sube": "TYT",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5459205332.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5356652932"
      }
    ]
  },
  {
    "ad": "RABİA",
    "soyad": "FİDAN",
    "sinif": "MEZUN",
    "sube": "MEA2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5528276032.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5050423958"
      }
    ]
  },
  {
    "ad": "RABİA NUR",
    "soyad": "KOYUNCU",
    "sinif": "MEZUN",
    "sube": "MEA1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5412136009.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5365606503"
      }
    ]
  },
  {
    "ad": "RANA SU",
    "soyad": "YILDIRIM",
    "sinif": "11",
    "sube": "SAY2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5510842153.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5376556578"
      }
    ]
  },
  {
    "ad": "RAŞA",
    "soyad": "AHMET",
    "sinif": "12",
    "sube": "SAY2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5057457966.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5347767966"
      }
    ]
  },
  {
    "ad": "RAVZA",
    "soyad": "BAKIRHAN",
    "sinif": "12",
    "sube": "SAY1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5313440109.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5367813130"
      }
    ]
  },
  {
    "ad": "RAVZA SU",
    "soyad": "İLGÜN",
    "sinif": "11",
    "sube": "SAY2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5363905425.0"
      },
      {
        "alan": "e_mail",
        "deger": "ilgunravza08@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5368964884"
      }
    ]
  },
  {
    "ad": "ROJDA",
    "soyad": "GÜRBÜZ",
    "sinif": "11",
    "sube": "SAY2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5330695044.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "530184966"
      }
    ]
  },
  {
    "ad": "ROJDA",
    "soyad": "GÜZEL",
    "sinif": "MEZUN",
    "sube": "MEA2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5308897819.0"
      },
      {
        "alan": "e_mail",
        "deger": "guzelrojda7@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5344112785"
      }
    ]
  },
  {
    "ad": "RÜMEYSA",
    "soyad": "BAYINDIR",
    "sinif": "12",
    "sube": "EA3",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5527552021.0"
      },
      {
        "alan": "e_mail",
        "deger": "rumeysabayindir@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5366294746"
      }
    ]
  },
  {
    "ad": "RÜMEYSANUR",
    "soyad": "DERİNCE",
    "sinif": "MEZUN",
    "sube": "MSAY2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5550792837.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5449696791"
      }
    ]
  },
  {
    "ad": "RÜYA",
    "soyad": "KOÇOĞLU",
    "sinif": "10",
    "sube": "nan",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5354793840.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5316311310"
      }
    ]
  },
  {
    "ad": "RÜZGAR DENİZ",
    "soyad": "AYDIN",
    "sinif": "11",
    "sube": "EA2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5393969300.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5372691300"
      }
    ]
  },
  {
    "ad": "SAVAŞ",
    "soyad": "ATABEY",
    "sinif": "MEZUN",
    "sube": "MSAY3",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5356486847.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5462944036"
      }
    ]
  },
  {
    "ad": "SEDA ŞEVVAL",
    "soyad": "İLDİZ",
    "sinif": "12",
    "sube": "EA3",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5433695317.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5357999443"
      }
    ]
  },
  {
    "ad": "SEDAT",
    "soyad": "SOLMAZ",
    "sinif": "MEZUN",
    "sube": "MEA3",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5523368137.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5327830990"
      }
    ]
  },
  {
    "ad": "SEDAT EGE",
    "soyad": "TEKMİR",
    "sinif": "12",
    "sube": "EA1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5304716610.0"
      },
      {
        "alan": "e_mail",
        "deger": "sedategetekmir@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5326716610"
      }
    ]
  },
  {
    "ad": "SEDEF",
    "soyad": "ÖZMEN",
    "sinif": "MEZUN",
    "sube": "MSAY2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5439462696.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5374192332"
      }
    ]
  },
  {
    "ad": "SEFA",
    "soyad": "YARDIMCI",
    "sinif": "MEZUN",
    "sube": "MEA2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5539556819.0"
      },
      {
        "alan": "e_mail",
        "deger": "sefayardimci2007@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5362380110"
      }
    ]
  },
  {
    "ad": "SEFA MURAT",
    "soyad": "ŞAHİN",
    "sinif": "10",
    "sube": "nan",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5309236081.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5443864995"
      }
    ]
  },
  {
    "ad": "SELİME",
    "soyad": "DİREK",
    "sinif": "MEZUN",
    "sube": "MEA1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5442244024.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5301823424"
      }
    ]
  },
  {
    "ad": "SELİN",
    "soyad": "KARAKURT",
    "sinif": "MEZUN",
    "sube": "MEA1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5551081518.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5354017024"
      }
    ]
  },
  {
    "ad": "SEMANUR",
    "soyad": "KARAGÜLMEZ",
    "sinif": "12",
    "sube": "TYT",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5540096875.0"
      },
      {
        "alan": "e_mail",
        "deger": "ksemmannur@icloud.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5349128913"
      }
    ]
  },
  {
    "ad": "SEMİH",
    "soyad": "ERCAN",
    "sinif": "12",
    "sube": "EA2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5342312549.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5393801987"
      }
    ]
  },
  {
    "ad": "SEMİH",
    "soyad": "KARABAĞ",
    "sinif": "12",
    "sube": "EA1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5316055108.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5426895108"
      }
    ]
  },
  {
    "ad": "SENA",
    "soyad": "OYNAK",
    "sinif": "12",
    "sube": "EA2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5389676628.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5303844015"
      }
    ]
  },
  {
    "ad": "SENA NUR",
    "soyad": "BEKTAŞ",
    "sinif": "MEZUN",
    "sube": "MSAY2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5531360349.0"
      },
      {
        "alan": "e_mail",
        "deger": "senanurbektaass.snb.38@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5354418872"
      }
    ]
  },
  {
    "ad": "SENANUR",
    "soyad": "DAŞDEMİR",
    "sinif": "12",
    "sube": "EA1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5516910178.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5425205196"
      }
    ]
  },
  {
    "ad": "SENANUR",
    "soyad": "BAYRAK",
    "sinif": "12",
    "sube": "EA3",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5348723460.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5310892670"
      }
    ]
  },
  {
    "ad": "SERCAN",
    "soyad": "KAYGUSUZ",
    "sinif": "MEZUN",
    "sube": "TYT",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5359267014.0"
      },
      {
        "alan": "e_mail",
        "deger": "sercanxkaygusuz@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5352602611"
      }
    ]
  },
  {
    "ad": "SERHAT",
    "soyad": "YALÇIN",
    "sinif": "12",
    "sube": "EA2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5358946549.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5393575462"
      }
    ]
  },
  {
    "ad": "SERHAT ATA",
    "soyad": "SERİN",
    "sinif": "12",
    "sube": "EA3",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5522515864.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5522585248"
      }
    ]
  },
  {
    "ad": "SERRA",
    "soyad": "SARIKAYA",
    "sinif": "11",
    "sube": "EA2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5309415494.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5373595233"
      }
    ]
  },
  {
    "ad": "SERRA",
    "soyad": "MAVZER",
    "sinif": "MEZUN",
    "sube": "MEA2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5396036454.0"
      },
      {
        "alan": "e_mail",
        "deger": "serramavzer6@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5337154634"
      }
    ]
  },
  {
    "ad": "SEZEN",
    "soyad": "OCAK",
    "sinif": "11",
    "sube": "EA2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5315182458.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5374046496"
      }
    ]
  },
  {
    "ad": "SILA",
    "soyad": "ÖĞET",
    "sinif": "12",
    "sube": "EA1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5459537745.0"
      },
      {
        "alan": "e_mail",
        "deger": "opollo474734@gmal.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5385970967"
      }
    ]
  },
  {
    "ad": "SILA",
    "soyad": "KOÇAK",
    "sinif": "MEZUN",
    "sube": "MEA3",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5411232077.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5465642029"
      }
    ]
  },
  {
    "ad": "SİMGE",
    "soyad": "ERAYDIN",
    "sinif": "11",
    "sube": "EA2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5078409557.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5359485407"
      }
    ]
  },
  {
    "ad": "SİNEM BUSE",
    "soyad": "GÜNGÖR",
    "sinif": "11",
    "sube": "EA2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5524783658.0"
      },
      {
        "alan": "e_mail",
        "deger": "sinembuse5858@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5376712557"
      }
    ]
  },
  {
    "ad": "SUDE NAZ",
    "soyad": "DEMİRCİ",
    "sinif": "12",
    "sube": "EA3",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5510877527.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5356271782"
      }
    ]
  },
  {
    "ad": "SUDEN  ECE",
    "soyad": "SARI",
    "sinif": "11",
    "sube": "EA1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5539839974.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5327722033"
      }
    ]
  },
  {
    "ad": "SUDENAZ",
    "soyad": "BULUT",
    "sinif": "MEZUN",
    "sube": "MSAY3",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5524612934.0"
      },
      {
        "alan": "e_mail",
        "deger": "sudebulut523@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5514066340"
      }
    ]
  },
  {
    "ad": "SUDENUR",
    "soyad": "ALTUNOK",
    "sinif": "12",
    "sube": "SAY2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5518505295.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5312736850"
      }
    ]
  },
  {
    "ad": "SULTAN BETÜL",
    "soyad": "ŞEREMET",
    "sinif": "12",
    "sube": "TYT",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5388597463.0"
      },
      {
        "alan": "e_mail",
        "deger": "sbseremet@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5353392793"
      }
    ]
  },
  {
    "ad": "SUNA",
    "soyad": "KARATAŞ",
    "sinif": "12",
    "sube": "TYT",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5446808297.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5432473299"
      }
    ]
  },
  {
    "ad": "SÜEDA ZEYNEP",
    "soyad": "ÖKSÜZ",
    "sinif": "11",
    "sube": "EA1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5551621636.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5070112846"
      }
    ]
  },
  {
    "ad": "SÜMEYYE NUR",
    "soyad": "KILIÇARSLAN",
    "sinif": "12",
    "sube": "EA2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5056775258.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5363072984"
      }
    ]
  },
  {
    "ad": "ŞAZİYE BETÜL",
    "soyad": "TAZEGÜL",
    "sinif": "11",
    "sube": "TYT",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5431051416.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5511264960"
      }
    ]
  },
  {
    "ad": "ŞERİFE GİZEM",
    "soyad": "ŞİRİN",
    "sinif": "MEZUN",
    "sube": "MEA2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5397406437.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5316785454"
      }
    ]
  },
  {
    "ad": "ŞEVVAL",
    "soyad": "BOZ",
    "sinif": "MEZUN",
    "sube": "MEA1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5339610429.0"
      },
      {
        "alan": "e_mail",
        "deger": "sevvalbz29@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5322247119"
      }
    ]
  },
  {
    "ad": "ŞEVVAL",
    "soyad": "BEREKET",
    "sinif": "12",
    "sube": "SAY1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5313127002.0"
      },
      {
        "alan": "e_mail",
        "deger": "selvaribereket@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5363389271"
      }
    ]
  },
  {
    "ad": "ŞEVVAL",
    "soyad": "ALBAYRAK",
    "sinif": "12",
    "sube": "EA2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5423810918.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5551904972"
      }
    ]
  },
  {
    "ad": "ŞEVVAL",
    "soyad": "DUMANOĞLU",
    "sinif": "11",
    "sube": "SAY2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5319156077.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5366377375"
      }
    ]
  },
  {
    "ad": "ŞEVVAL",
    "soyad": "KUĞUCAK",
    "sinif": "11",
    "sube": "EA2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5523691414.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5312164948"
      }
    ]
  },
  {
    "ad": "ŞEVVAL SEVİM",
    "soyad": "DUDU",
    "sinif": "12",
    "sube": "EA2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5385817618.0"
      },
      {
        "alan": "e_mail",
        "deger": "sevvaldudu8@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5311034894"
      }
    ]
  },
  {
    "ad": "ŞEVVİN",
    "soyad": "ÖZBAY",
    "sinif": "11",
    "sube": "SAY2",
    "iletisim": [
      {
        "alan": "veli_iletisim",
        "deger": "5355672441"
      }
    ]
  },
  {
    "ad": "ŞEYMA",
    "soyad": "KUŞ",
    "sinif": "MEZUN",
    "sube": "MSAY3",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5303611032.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5347982933"
      }
    ]
  },
  {
    "ad": "ŞEYMA AYLİN",
    "soyad": "TİRYAKİ",
    "sinif": "12",
    "sube": "SAY3",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5421627309.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5373045227"
      }
    ]
  },
  {
    "ad": "ŞİFA",
    "soyad": "ERDEM",
    "sinif": "12",
    "sube": "EA2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5526558947.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5380734747"
      }
    ]
  },
  {
    "ad": "TARIK FATİH",
    "soyad": "AKBAŞ",
    "sinif": "MEZUN",
    "sube": "MSAY2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5510884602.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5320681975"
      }
    ]
  },
  {
    "ad": "TOLGA",
    "soyad": "DER",
    "sinif": "MEZUN",
    "sube": "MEA2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5435797170.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5398121337"
      }
    ]
  },
  {
    "ad": "TOPRAK",
    "soyad": "AKÇALI",
    "sinif": "MEZUN",
    "sube": "MEA2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5462293721.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5438237487"
      }
    ]
  },
  {
    "ad": "TUANA",
    "soyad": "SARICA",
    "sinif": "12",
    "sube": "EA1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5309925482.0"
      },
      {
        "alan": "e_mail",
        "deger": "saricatuana7@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5332786010"
      }
    ]
  },
  {
    "ad": "TUANA",
    "soyad": "MEĞRİLİ",
    "sinif": "MEZUN",
    "sube": "MSAY2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5538101528.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5382435368"
      }
    ]
  },
  {
    "ad": "TUANA",
    "soyad": "HACIHALİLOĞLU",
    "sinif": "MEZUN",
    "sube": "MSAY3",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5538456161.0"
      },
      {
        "alan": "e_mail",
        "deger": "tuanabtw0@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5538616161"
      }
    ]
  },
  {
    "ad": "TUANA",
    "soyad": "SEYREKBASAN",
    "sinif": "12",
    "sube": "EA3",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5510187263.0"
      },
      {
        "alan": "e_mail",
        "deger": "tuanaseyrekbasan1903@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5424969142"
      }
    ]
  },
  {
    "ad": "TUANA SENA",
    "soyad": "GÜNEL",
    "sinif": "12",
    "sube": "EA2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5523868539.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5457743342"
      }
    ]
  },
  {
    "ad": "TUĞBA NUR",
    "soyad": "ÖZKAN",
    "sinif": "MEZUN",
    "sube": "MEA1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5510735662.0"
      },
      {
        "alan": "e_mail",
        "deger": "tubanurozkan26@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5327802227"
      }
    ]
  },
  {
    "ad": "TUĞBA NUR",
    "soyad": "KOCAMAN",
    "sinif": "MEZUN",
    "sube": "MEA3",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5511766535.0"
      },
      {
        "alan": "e_mail",
        "deger": "tubiskov28@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5542191112"
      }
    ]
  },
  {
    "ad": "TUNA",
    "soyad": "YANGIN",
    "sinif": "11",
    "sube": "SAY1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5456753701.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5435124895"
      }
    ]
  },
  {
    "ad": "TUNA",
    "soyad": "GÖKCEVİZ",
    "sinif": "MEZUN",
    "sube": "MEA1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5423322738.0"
      },
      {
        "alan": "e_mail",
        "deger": "tunagokceviz@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5444423686"
      }
    ]
  },
  {
    "ad": "TUNA",
    "soyad": "MAMAT",
    "sinif": "MEZUN",
    "sube": "TYT",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5448328203.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5377691277"
      }
    ]
  },
  {
    "ad": "UĞUR ERDEM",
    "soyad": "GELİR",
    "sinif": "11",
    "sube": "SAY2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5368833071.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5447987044"
      }
    ]
  },
  {
    "ad": "UMUT EREN",
    "soyad": "TURHAN",
    "sinif": "11",
    "sube": "EA1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5527410907.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5374197838"
      }
    ]
  },
  {
    "ad": "UMUT RÜYA",
    "soyad": "ZOR",
    "sinif": "12",
    "sube": "EA1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5339638099.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5524278046"
      }
    ]
  },
  {
    "ad": "UTKU",
    "soyad": "KULAK",
    "sinif": "12",
    "sube": "EA1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5525662874.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5316788615"
      }
    ]
  },
  {
    "ad": "YAĞIZ",
    "soyad": "KOZAKLI",
    "sinif": "12",
    "sube": "EA3",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5360266870.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5335275261"
      }
    ]
  },
  {
    "ad": "YAĞIZ",
    "soyad": "ÖZGEN",
    "sinif": "11",
    "sube": "EA1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5422656588.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5422656588"
      }
    ]
  },
  {
    "ad": "YAĞMUR",
    "soyad": "ORUÇ",
    "sinif": "11",
    "sube": "EA1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5348582757.0"
      },
      {
        "alan": "e_mail",
        "deger": "orucyagmur790@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5462927755"
      }
    ]
  },
  {
    "ad": "YAĞMUR",
    "soyad": "SAVAŞ",
    "sinif": "11",
    "sube": "SAY1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5525781907.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5062934087"
      }
    ]
  },
  {
    "ad": "YAĞMUR BEYZA",
    "soyad": "DEMİR",
    "sinif": "MEZUN",
    "sube": "MEA2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5516540713.0"
      },
      {
        "alan": "e_mail",
        "deger": "yagmur342007@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5422034323"
      }
    ]
  },
  {
    "ad": "YAĞMUR NAZ",
    "soyad": "KARAPUNAR",
    "sinif": "12",
    "sube": "EA1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5466432737.0"
      },
      {
        "alan": "e_mail",
        "deger": "yagmurnazkarapunar1@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5356823384"
      }
    ]
  },
  {
    "ad": "YASEMİN",
    "soyad": "YILDIRIM",
    "sinif": "MEZUN",
    "sube": "MEA3",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5347037673.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5557373093"
      }
    ]
  },
  {
    "ad": "YELİZ",
    "soyad": "ÖZCAN",
    "sinif": "12",
    "sube": "EA1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5510209790.0"
      },
      {
        "alan": "e_mail",
        "deger": "yelizozcan37@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5399593677"
      }
    ]
  },
  {
    "ad": "YELİZ",
    "soyad": "YAMAN",
    "sinif": "12",
    "sube": "EA2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5518334183.0"
      },
      {
        "alan": "e_mail",
        "deger": "yelizyaman072@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5453703425"
      }
    ]
  },
  {
    "ad": "YETER NUR",
    "soyad": "DAZKIRLI",
    "sinif": "11",
    "sube": "SAY2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5558821042.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5316651092"
      }
    ]
  },
  {
    "ad": "YETKİN",
    "soyad": "YOLCU",
    "sinif": "MEZUN",
    "sube": "TYT",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5434307320.0"
      },
      {
        "alan": "e_mail",
        "deger": "yetiny09@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5374307320"
      }
    ]
  },
  {
    "ad": "YİĞİT ANIL",
    "soyad": "SUEKİNCİ",
    "sinif": "12",
    "sube": "EA1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5467130415.0"
      },
      {
        "alan": "e_mail",
        "deger": "yigitsuekinci07@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5462187704"
      }
    ]
  },
  {
    "ad": "YİĞİT EREN",
    "soyad": "YOLDAŞ",
    "sinif": "12",
    "sube": "SAY1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5456686547.0"
      },
      {
        "alan": "e_mail",
        "deger": "yigiteren2708@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5383430330"
      }
    ]
  },
  {
    "ad": "YİĞİT EREN",
    "soyad": "ÜSTÜN",
    "sinif": "11",
    "sube": "SAY1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5306530062.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5306530062"
      }
    ]
  },
  {
    "ad": "YUDUM",
    "soyad": "KUCUR",
    "sinif": "MEZUN",
    "sube": "MSAY3",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5511661134.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5386835970"
      }
    ]
  },
  {
    "ad": "YUNUS EMRE",
    "soyad": "POLAT",
    "sinif": "MEZUN",
    "sube": "MEA3",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5525933776.0"
      },
      {
        "alan": "e_mail",
        "deger": "yunusemrepolat7384@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5326641374"
      }
    ]
  },
  {
    "ad": "YUNUS EMRE",
    "soyad": "KAYAR",
    "sinif": "MEZUN",
    "sube": "MEA2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5523482058.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5072535874"
      }
    ]
  },
  {
    "ad": "YUSUF",
    "soyad": "ERGÜL",
    "sinif": "MEZUN",
    "sube": "MEA3",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5511376090.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5388179493"
      }
    ]
  },
  {
    "ad": "YUSUF",
    "soyad": "BULDU",
    "sinif": "12",
    "sube": "SAY2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5057057695.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5346642637"
      }
    ]
  },
  {
    "ad": "YUSUF",
    "soyad": "ŞAHİN",
    "sinif": "12",
    "sube": "EA1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5421207840.0"
      },
      {
        "alan": "e_mail",
        "deger": "ysahin12162008@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5365407840"
      }
    ]
  },
  {
    "ad": "YUSUF",
    "soyad": "ÖZDEMİR",
    "sinif": "MEZUN",
    "sube": "MSAY1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5551934453.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5377647405"
      }
    ]
  },
  {
    "ad": "YUSUF SAMİ",
    "soyad": "FAZLIOĞLU",
    "sinif": "12",
    "sube": "SAY3",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5066831549.0"
      },
      {
        "alan": "e_mail",
        "deger": "yusufsamifazlioglu@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5353533550"
      }
    ]
  },
  {
    "ad": "YUSUFCAN",
    "soyad": "VAROL",
    "sinif": "9",
    "sube": "nan",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5065856447.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5078559034"
      }
    ]
  },
  {
    "ad": "ZEHRA",
    "soyad": "SARIOĞLU",
    "sinif": "11",
    "sube": "TYT",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5411391274.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5315883571"
      }
    ]
  },
  {
    "ad": "ZEHRA NAZ",
    "soyad": "ANGİ",
    "sinif": "12",
    "sube": "TYT",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5528863436.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5428963518"
      }
    ]
  },
  {
    "ad": "ZEHRA NUR",
    "soyad": "AKKAŞ",
    "sinif": "11",
    "sube": "EA2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5516373178.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5315197572"
      }
    ]
  },
  {
    "ad": "ZEYNEP",
    "soyad": "YILDIZ",
    "sinif": "MEZUN",
    "sube": "MSAY3",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5304288631.0"
      },
      {
        "alan": "e_mail",
        "deger": "zeyyildiz6161@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5434909833"
      }
    ]
  },
  {
    "ad": "ZEYNEP",
    "soyad": "BOĞA",
    "sinif": "MEZUN",
    "sube": "MEA3",
    "iletisim": [
      {
        "alan": "veli_iletisim",
        "deger": "5387146792"
      }
    ]
  },
  {
    "ad": "ZEYNEP",
    "soyad": "ÖKSÜZ",
    "sinif": "11",
    "sube": "SAY2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5369983453.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5367456281"
      }
    ]
  },
  {
    "ad": "ZEYNEP",
    "soyad": "ÖZYOLU",
    "sinif": "12",
    "sube": "EA2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5010957936.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5525399136"
      }
    ]
  },
  {
    "ad": "ZEYNEP",
    "soyad": "İLME",
    "sinif": "12",
    "sube": "EA1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5449392603.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5511003909"
      }
    ]
  },
  {
    "ad": "ZEYNEP",
    "soyad": "BEKTAŞ",
    "sinif": "MEZUN",
    "sube": "MSAY3",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5520180555.0"
      },
      {
        "alan": "e_mail",
        "deger": "zeynepbek.1907@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5308227095"
      }
    ]
  },
  {
    "ad": "ZEYNEP",
    "soyad": "ÖĞÜT",
    "sinif": "11",
    "sube": "SAY2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5510841792.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5389308097"
      }
    ]
  },
  {
    "ad": "ZEYNEP BELİNAY",
    "soyad": "TELELİ",
    "sinif": "11",
    "sube": "SAY1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5388760176.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5374376111"
      }
    ]
  },
  {
    "ad": "ZEYNEP BEREN",
    "soyad": "OĞUZ",
    "sinif": "12",
    "sube": "EA3",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5510750624.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5369311208"
      }
    ]
  },
  {
    "ad": "ZEYNEP CEYLİN",
    "soyad": "AKKOÇ",
    "sinif": "11",
    "sube": "EA1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5525226575.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5424334460"
      }
    ]
  },
  {
    "ad": "ZEYNEP ECE",
    "soyad": "BAL",
    "sinif": "MEZUN",
    "sube": "MEA2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5334763011.0"
      },
      {
        "alan": "e_mail",
        "deger": "barisbal101@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5356646729"
      }
    ]
  },
  {
    "ad": "ZEYNEP EYLÜL",
    "soyad": "ALINAK",
    "sinif": "12",
    "sube": "EA1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5396551812.0"
      },
      {
        "alan": "e_mail",
        "deger": "zeynepalinak12@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5398403426"
      }
    ]
  },
  {
    "ad": "ZEYNEP EZGİ",
    "soyad": "UĞURLU",
    "sinif": "12",
    "sube": "EA2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5523584871.0"
      },
      {
        "alan": "e_mail",
        "deger": "zezgiugurlu2009@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5358479039"
      }
    ]
  },
  {
    "ad": "ZEYNEP GÜL",
    "soyad": "ESKİTOĞLU",
    "sinif": "11",
    "sube": "SAY1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5378725767.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5516372453"
      }
    ]
  },
  {
    "ad": "ZEYNEP NAZ",
    "soyad": "EMEKSİZ",
    "sinif": "MEZUN",
    "sube": "MEA1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5525591301.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5550651226"
      }
    ]
  },
  {
    "ad": "ZEYNEP SUDE",
    "soyad": "GÜNAYDIN",
    "sinif": "11",
    "sube": "SAY2",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5306286012.0"
      },
      {
        "alan": "e_mail",
        "deger": "zeynepsudegunaydin2343@gmail.com"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5358223106"
      }
    ]
  },
  {
    "ad": "RÜZGAR",
    "soyad": "YILDIRIM",
    "sinif": "11",
    "sube": "EA1",
    "iletisim": [
      {
        "alan": "iletisim",
        "deger": "5431603770.0"
      },
      {
        "alan": "veli_iletisim",
        "deger": "5432682271"
      }
    ]
  }
];

// 🗂️ Sınıf tanımları
const CLASS_DEFINITIONS = [
  { id: 'tyt', name: 'TYT Sınıfı', schedule: { cumartesi: 6, pazar: 4 } },
  { id: '9', name: '9. Sınıf', schedule: { cumartesi: 4, pazar: 4 } },
  { id: '10', name: '10. Sınıf', schedule: { salı: 4, perşembe: 4 } },
  { id: '11-say-1', name: '11 Say 1', schedule: {} },
  { id: '11-say-2', name: '11 Say 2', schedule: {} },
  { id: '11-ea-1', name: '11 Ea 1', schedule: {} },
  { id: '11-ea-2', name: '11 Ea 2', schedule: {} },
  { id: '12-say-1', name: '12 Say 1', schedule: { salı: 4, perşembe: 4, cumartesi: 6, pazar: 6 } },
  { id: '12-say-2', name: '12 Say 2', schedule: { salı: 4, perşembe: 4, cumartesi: 6, pazar: 6 } },
  { id: '12-say-3', name: '12 Say 3', schedule: { salı: 4, perşembe: 4, cumartesi: 6, pazar: 6 } },
  { id: '12-ea-1', name: '12 Ea 1', schedule: { salı: 4, perşembe: 4, cumartesi: 6, pazar: 6 } },
  { id: '12-ea-2', name: '12 Ea 2', schedule: { salı: 4, perşembe: 4, cumartesi: 6, pazar: 6 } },
  { id: '12-ea-3', name: '12 Ea 3', schedule: { salı: 4, perşembe: 4, cumartesi: 6, pazar: 6 } },
  { id: 'mezun-ea-1', name: 'Mezun Ea 1', schedule: { pazartesi: 6, salı: 6, perşembe: 6, cuma: 6 } },
  { id: 'mezun-ea-2', name: 'Mezun Ea 2', schedule: { pazartesi: 6, salı: 6, perşembe: 6, cuma: 6 } },
  { id: 'mezun-ea-3', name: 'Mezun Ea 3', schedule: { pazartesi: 6, salı: 6, perşembe: 6, cuma: 6 } },
  { id: 'mezun-say-1', name: 'Mezun Say 1', schedule: { pazartesi: 6, salı: 6, perşembe: 6, cuma: 6 } },
  { id: 'mezun-say-2', name: 'Mezun Say 2', schedule: { pazartesi: 6, salı: 6, perşembe: 6, cuma: 6 } },
  { id: 'mezun-say-3', name: 'Mezun Say 3', schedule: { pazartesi: 6, salı: 6, perşembe: 6, cuma: 6 } },
];

// 🔄 Sınıf adını JSON'daki "sinif" ve "sube" bilgisine göre eşleştir
function mapStudentToClassId(student) {
  const sinif = student.sinif?.toUpperCase();
  const sube = (student.sube || '').toUpperCase().replace('NAN', '');

  if (sinif === 'TYT') return 'tyt';
  if (sinif === '9') return '9';
  if (sinif === '10') return '10';
  if (sinif === '11') {
    if (sube.includes('SAY')) return '11-say-1'; // veya 2, basit tutmak için hepsi 1'e
    if (sube.includes('EA')) return '11-ea-1';
    return '11-say-1';
  }
  if (sinif === '12') {
    if (sube.includes('SAY')) return '12-say-1';
    if (sube.includes('EA')) return '12-ea-1';
    return '12-say-1';
  }
  if (sinif === 'MEZUN') {
    if (sube.includes('MEA') || sube.includes('EA')) return 'mezun-ea-1';
    if (sube.includes('MSAY') || sube.includes('SAY')) return 'mezun-say-1';
    return 'mezun-ea-1';
  }
  return null;
}

// 🧠 Öğrenci verilerini sınıflara göre grupla
function buildStudentsFromJson(data) {
  const students = {};
  data.forEach((student, index) => {
    const classId = mapStudentToClassId(student);
    if (!classId) return;

    const fullName = `${student.ad} ${student.soyad}`.trim();
    if (!fullName) return;

    if (!students[classId]) students[classId] = [];
    students[classId].push({
      id: `${classId}-${index}`,
      name: fullName,
    });
  });
  return students;
}

const AttendanceSystem = () => {
  const [classes] = useState(CLASS_DEFINITIONS);
  const [students, setStudents] = useState({});
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState({});
  const [savedRecords, setSavedRecords] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('yoklama');
  const [newStudentName, setNewStudentName] = useState('');

  // 🚀 JSON veriyi yükle
  useEffect(() => {
    const loaded = buildStudentsFromJson(STUDENT_DATA);
    setStudents(loaded);
  }, []);

  // 📅 Seçilen tarihe göre ders sayısı
  const getLessonCount = () => {
    const cls = classes.find(c => c.id === selectedClass);
    if (!cls) return 0;
    const date = new Date(selectedDate + 'T00:00:00');
    const dayNames = ['pazar', 'pazartesi', 'salı', 'çarşamba', 'perşembe', 'cuma', 'cumartesi'];
    return cls.schedule[dayNames[date.getDay()]] || 0;
  };

  const classStudents = students[selectedClass] || [];
  const lessonCount = getLessonCount();

  const handleAttendanceChange = (studentId, lessonNumber, status) => {
    setAttendance(prev => ({
      ...prev,
      [`${studentId}-${lessonNumber}`]: status
    }));
  };

  const saveAttendance = () => {
    const key = `${selectedClass}-${selectedDate}`;
    if (lessonCount === 0) {
      setMessage({ type: 'error', text: 'Bu sınıfın bu gün için ders programı yok!' });
      return;
    }
    const newRecords = { ...savedRecords, [key]: { ...attendance } };
    setSavedRecords(newRecords);
    setMessage({ type: 'success', text: 'Yoklama kaydedildi!' });
  };

  const addStudent = () => {
    if (!newStudentName.trim() || !selectedClass) return;
    const newStudents = { ...students };
    if (!newStudents[selectedClass]) newStudents[selectedClass] = [];
    newStudents[selectedClass].push({
      id: `${selectedClass}-${Date.now()}`,
      name: newStudentName.trim()
    });
    setStudents(newStudents);
    setNewStudentName('');
    setMessage({ type: 'success', text: 'Öğrenci eklendi!' });
  };

  const removeStudent = (studentId) => {
    if (!window.confirm('Bu öğrenciyi silmek istediğinizden emin misiniz?')) return;
    const newStudents = { ...students };
    newStudents[selectedClass] = newStudents[selectedClass].filter(s => s.id !== studentId);
    setStudents(newStudents);
    setMessage({ type: 'success', text: 'Öğrenci silindi!' });
  };

  const downloadCSV = () => {
    const className = classes.find(c => c.id === selectedClass)?.name || selectedClass;
    let csv = `Sınıf:,${className}\nTarih:,${selectedDate}\n\n`;
    csv += 'Öğrenci Adı,' + Array.from({ length: lessonCount }, (_, i) => `${i + 1}. Ders`).join(',') + '\n';

    classStudents.forEach(student => {
      const row = [student.name];
      for (let i = 1; i <= lessonCount; i++) {
        const status = attendance[`${student.id}-${i}`] || '-';
        row.push(status);
      }
      csv += row.join(',') + '\n';
    });

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Yoklama_${className}_${selectedDate}.csv`;
    link.click();
  };

  const getStatusColor = (status) => {
    const colors = {
      'geldi': 'bg-green-500 hover:bg-green-600 text-white',
      'gelmedi': 'bg-red-500 hover:bg-red-600 text-white',
      'mazeretli': 'bg-yellow-500 hover:bg-yellow-600 text-white',
      'izinli': 'bg-blue-500 hover:bg-blue-600 text-white'
    };
    return colors[status] || 'bg-gray-300 hover:bg-gray-400 text-gray-700';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'geldi': <Check className="w-4 h-4" />,
      'gelmedi': <X className="w-4 h-4" />,
      'mazeretli': <AlertCircle className="w-4 h-4" />,
      'izinli': <Calendar className="w-4 h-4" />
    };
    return icons[status] || null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-800">Ata Akademi Yoklama Sistemi</h1>
          </div>

          <div className="flex gap-4 mb-6 border-b">
            {[
              { id: 'yoklama', label: 'Yoklama Gir', icon: Check },
              { id: 'raporlar', label: 'Raporlar', icon: FileText },
              { id: 'yukle', label: 'Öğrenci Yönetimi', icon: Users },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {message.text && (
            <div className={`p-4 rounded-lg mb-4 ${
              message.type === 'success' ? 'bg-green-100 text-green-800' :
              message.type === 'error' ? 'bg-red-100 text-red-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {message.text}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sınıf Seçin</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Sınıf seçiniz...</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tarih Seçin</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {activeTab === 'yoklama' && selectedClass && classStudents.length > 0 && lessonCount > 0 && (
            <div>
              <div className="mb-4 p-4 bg-indigo-50 rounded-lg flex justify-between items-center">
                <p className="text-sm font-medium text-indigo-800">
                  {classStudents.length} öğrenci • {lessonCount} ders
                </p>
                <button onClick={downloadCSV} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm">
                  <Download className="w-4 h-4" /> CSV İndir
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="p-3 text-left font-semibold text-gray-700 border">Öğrenci Adı</th>
                      {Array.from({ length: lessonCount }, (_, i) => (
                        <th key={i} className="p-3 text-center font-semibold text-gray-700 border">{i + 1}. Ders</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {classStudents.map(student => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="p-3 font-medium text-gray-800 border">{student.name}</td>
                        {Array.from({ length: lessonCount }, (_, i) => {
                          const key = `${student.id}-${i + 1}`;
                          const currentStatus = attendance[key] || '';
                          return (
                            <td key={i} className="p-2 border">
                              <div className="flex gap-1 justify-center">
                                {['geldi', 'gelmedi', 'mazeretli', 'izinli'].map(status => (
                                  <button
                                    key={status}
                                    onClick={() => handleAttendanceChange(student.id, i + 1, status)}
                                    className={`p-2 rounded transition-all ${
                                      currentStatus === status
                                        ? getStatusColor(status)
                                        : 'bg-gray-100 text-gray-400'
                                    }`}
                                  >
                                    {getStatusIcon(status)}
                                  </button>
                                ))}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                onClick={saveAttendance}
                className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" /> Yoklamayı Kaydet
              </button>
            </div>
          )}

          {activeTab === 'yukle' && (
            <div>
              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addStudent()}
                  placeholder={selectedClass ? 'Öğrenci adı...' : 'Önce sınıf seçin'}
                  disabled={!selectedClass}
                  className="flex-1 p-3 border rounded-lg"
                />
                <button
                  onClick={addStudent}
                  disabled={!selectedClass || !newStudentName.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg disabled:opacity-50"
                >
                  Ekle
                </button>
              </div>

              {classStudents.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <p className="font-medium mb-2">Kayıtlı Öğrenciler ({classStudents.length}):</p>
                  {classStudents.map((student, idx) => (
                    <div key={student.id} className="flex justify-between items-center bg-white p-2 rounded mb-1">
                      <span className="text-sm">{idx + 1}. {student.name}</span>
                      <button onClick={() => removeStudent(student.id)} className="text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'raporlar' && (
            <div className="text-center py-12 text-gray-600">
              <FileText className="w-12 h-12 mx-auto text-indigo-500 mb-4" />
              <p>Raporlama özelliği geliştirilmektedir.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceSystem;
