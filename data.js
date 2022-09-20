// ref: http://www.cxmedia.co.jp/school/color/color_pccs_tag.php
(function () {
    const pccs2rgb = "v1#B91F57,v3#DD443B,v5#E67800,v7#F1B500,v9#D2C100,v11#58A91D,v13#00926E,v15#007488,v17#00609C,v19#1A54A5,v21#703F96,v23#8F2E7C,v2#D02F48,v4#E95B23,v6#F49D00,v8#EEC900,v10#A8BB00,v12#00A15A,v14#00857F,v16#00709B,v18#005BA5,v20#534AA0,v22#81378A,v24#AD2E6C,b2#EF6C70,b4#FA8155,b6#FFAD36,b8#FAD831,b10#B7C82B,b12#41B879,b14#00AA9F,b16#0098B9,b18#2981C0,b20#7574BC,b22#A165A8,b24#D0678E,s2#C53F4D,s4#CC572E,s6#E19215,s8#DEBC03,s10#9CAD00,s12#008F56,s14#00827C,s16#006F92,s18#005B9B,s20#534C98,s22#7C3D84,s24#A33C6A,dp2#A61D39,dp4#AB3D1D,dp6#B16C00,dp8#B39300,dp10#748400,dp12#007243,dp14#006664,dp16#005476,dp18#004280,dp20#3E337B,dp22#612469,dp24#861D55,lt2+#F19896,lt4+#FFA787,lt6+#FFBE71,lt8+#F2D96E,lt10+#C7D36D,lt12+#85CE9E,lt14+#62C0B5,lt16+#5BAFC4,lt18+#6C9AC5,lt20+#9091C3,lt22+#B088B5,lt24+#D98EA5,lt2#F6ABA5,lt4#FFB99E,lt6#FFCE90,lt8#FBE68F,lt10#D8DF92,lt12#9CD9AC,lt14#7ECCC1,lt16#79BACA,lt18#83A7C8,lt20#A29FC7,lt22#B89AB8,lt24#DAA0B3,sf2#CA8281,sf4#DA927A,sf6#DBA66B,sf8#D3BD6C,sf10#ADB66B,sf12#76B18A,sf14#54A39B,sf16#5192A4,sf18#5D7EA0,sf20#7878A0,sf22#907194,sf24#B4788B,d2#A35A5C,d4#AF6954,d6#B37F46,d8#AB9446,d10#858F46,d12#4F8766,d14#2A7B76,d16#246A7D,d18#34597D,d20#54527C,d22#6C4A71,d24#8B4F65,dk2#692934,dk4#75362A,dk6#794D1C,dk8#74601F,dk10#525B20,dk12#23523A,dk14#004746,dk16#004558,dk18#123452,dk20#322D51,dk22#432848,dk24#612D46,p2+#E8C2BF,p4+#EBC2B5,p6+#F4D4B0,p8+#F2E6B8,p10+#D8DDAD,p12+#AED4B9,p14+#A6D4CC,p16+#ADD1DA,p18+#AFC0D1,p20+#BBBDD0,p22+#C8B9C9,p24+#DEC4CA,p2#E7D5D4,p4#E9D5CF,p6#F6E3CE,p8#EFE6C6,p10#E6E9C6,p12#C4E0CB,p14#BFE0D9,p16#C6DDE2,p18#C2CCD5,p20#C9CAD5,p22#D0C8D1,p24#E4D5D9,ltg2#C0ABAA,ltg4#C1ABA5,ltg6#CEBBA8,ltg8#C6BEA1,ltg10#BDC1A2,ltg12#9DB6A5,ltg14#98B6B1,ltg16#9EB4B9,ltg18#9BA5AF,ltg20#A2A2AF,ltg22#ABA0AB,ltg24#BDACB0,g2#745C5C,g4#755C57,g6#806C5C,g8#786F57,g10#6E725A,g12#53665A,g14#4E6764,g16#4F656C,g18#4C5765,g20#565566,g22#605262,g24#725C63,dkg2#3E2D30,dkg4#3F2E2C,dkg6#4A3C32,dkg8#443E30,dkg10#3D4033,dkg12#2A342E,dkg14#273434,dkg16#273439,dkg18#222933,dkg20#292734,dkg22#302531,dkg24#3D2E34,W#FFFFFF,Gy-9.5#F1F1F1,Gy-8.5#D6D6D6,Gy-7.5#BBBBBB,Gy-6.5#A1A1A1,Gy-5.5#878787,Gy-4.5#6D6D6D,Gy-3.5#545454,Gy-2.5#3C3C3C,Gy-1.5#272727,Bk#000000"

    const toneMap = {};
    pccs2rgb.split(',').forEach(s => {
        const [tone, color_] = s.split('#');
        toneMap[tone] = "#" + color_;
    });
    toneMap['ltGy'] = toneMap['Gy-8.5']
    toneMap['mGy'] = toneMap['Gy-5.5']
    toneMap['dkGy'] = toneMap['Gy-2.5']

    window.toneMap = toneMap;
    window.pccs2rgb = pccs2rgb;
})();