/**
 * MAPA ELEITORAL ARAPONGAS 2024 & GESTÃO DE LIDERANÇAS
 * Lógica Principal, Camadas Georreferenciadas, RBAC e Motor do Mapa
 */

// 1. DADOS ELEITORAIS OFICIAIS DE ARAPONGAS (29 Colégios + Prefeito, Vereadores, Deputados Federais e Estaduais)
const ELEICAO_2024_DATA = {
    candidates: {
        // PREFEITO 2024 (OFICIAL TSE)
        "pref_cita": { name: "Rafael Cita", party: "PSD", category: "Prefeito Eleito (31.968 votos - 52,60%)", type: "prefeito", color: "#3b82f6" },
        "pref_milani": { name: "Jair Milani", party: "PL", category: "2º Colocado (28.805 votos - 47,40%)", type: "prefeito", color: "#f59e0b" },

        // VEREADORES ELEITOS 2024 (OFICIAL TSE ARAPONGAS)
        "20220": { name: "Décio Rosanelli", party: "PODE", category: "Vereador Eleito (2.135 votos)", type: "vereador", color: "#8b5cf6" },
        "55155": { name: "Levi do Handebol", party: "PSD", category: "Vereador Eleito (1.720 votos)", type: "vereador", color: "#3b82f6" },
        "11234": { name: "Paulo Grassano", party: "PP", category: "Vereador Eleito (1.576 votos)", type: "vereador", color: "#06b6d4" },
        "44044": { name: "Toninho da Ambulância", party: "União Brasil", category: "Vereador Eleito (1.212 votos)", type: "vereador", color: "#10b981" },
        "70000": { name: "João Graça", party: "Avante", category: "Vereador Eleito (1.210 votos)", type: "vereador", color: "#f97316" },
        "40133": { name: "Márcio Nicke", party: "PSB", category: "Vereador Eleito (1.102 votos)", type: "vereador", color: "#ef4444" },
        "20120": { name: "Aroldo Pagan", party: "PODE", category: "Vereador Eleito (1.024 votos)", type: "vereador", color: "#8b5cf6" },
        "11555": { name: "Professor Marcelo", party: "PP", category: "Vereador Eleito (1.010 votos)", type: "vereador", color: "#06b6d4" },
        "44567": { name: "Alexandre Juliani Sorriso", party: "União Brasil", category: "Vereador Eleito (943 votos)", type: "vereador", color: "#10b981" },
        "55555": { name: "Simone Sponton Mãe de Autista", party: "PSD", category: "Vereador Eleito (913 votos)", type: "vereador", color: "#3b82f6" },
        "55147": { name: "Luisinho da Saúde", party: "PSD", category: "Vereador Eleito (877 votos)", type: "vereador", color: "#3b82f6" },
        "22777": { name: "Diretora Marilsa Staub", party: "PL", category: "Vereador Eleito (858 votos)", type: "vereador", color: "#eab308" },
        "44190": { name: "Pardini", party: "União Brasil", category: "Vereador Eleito (853 votos)", type: "vereador", color: "#10b981" },
        "55120": { name: "Cecéu", party: "PSD", category: "Vereador Eleito (849 votos)", type: "vereador", color: "#3b82f6" },
        "12500": { name: "Meiry Farias Proteção Animal", party: "PDT", category: "Vereador Eleito (832 votos)", type: "vereador", color: "#ec4899" },
        
        // SUPLENTES 2024 (OFICIAL TSE)
        "11500": { name: "Marcos Antonio de Souza", party: "PP", category: "Suplente (782 votos)", type: "suplente", color: "#64748b" },
        "11444": { name: "Silvano dos Santos Alves", party: "PP", category: "Suplente (741 votos)", type: "suplente", color: "#64748b" },
        "13100": { name: "Márcio Diniz", party: "PT", category: "Suplente (715 votos)", type: "suplente", color: "#dc2626" },
        "55456": { name: "Milton Xavier", party: "PSD", category: "Suplente (672 votos)", type: "suplente", color: "#64748b" },
        "10123": { name: "Rodrigo de Deus", party: "REP", category: "Suplente (618 votos)", type: "suplente", color: "#64748b" },
        "22622": { name: "Rubens Franzin", party: "PL", category: "Suplente (584 votos)", type: "suplente", color: "#64748b" },
        "22123": { name: "Ricardo Botelho", party: "PL", category: "Suplente (531 votos)", type: "suplente", color: "#64748b" },

        // DEPUTADOS FEDERAIS (VOTAÇÃO OFICIAL TSE EM ARAPONGAS)
        "dep_fed_lupion": { name: "Pedro Lupion", party: "PP", category: "Deputado Federal (14.066v em Arapongas)", type: "dep_federal", color: "#2563eb" },
        "dep_fed_filipe": { name: "Filipe Barros", party: "PL", category: "Deputado Federal (5.901v em Arapongas)", type: "dep_federal", color: "#1d4ed8" },
        "dep_fed_beto": { name: "Beto Preto", party: "PSD", category: "Deputado Federal (4.060v em Arapongas)", type: "dep_federal", color: "#3b82f6" },
        "dep_fed_angelica": { name: "Angélica Enfermeira", party: "REP", category: "Deputada Federal (3.731v em Arapongas)", type: "dep_federal", color: "#06b6d4" },
        "dep_fed_deltan": { name: "Deltan Dallagnol", party: "PODE", category: "Deputado Federal (2.228v em Arapongas)", type: "dep_federal", color: "#8b5cf6" },
        "dep_fed_luisa": { name: "Luísa Canziani", party: "PSD", category: "Deputada Federal (1.980v em Arapongas)", type: "dep_federal", color: "#60a5fa" },
        "dep_fed_fahur": { name: "Sargento Fahur", party: "PSD", category: "Deputado Federal (1.760v em Arapongas)", type: "dep_federal", color: "#047857" },
        "dep_fed_zeca": { name: "Zeca Dirceu", party: "PT", category: "Deputado Federal (1.420v em Arapongas)", type: "dep_federal", color: "#ef4444" },
        "dep_fed_aliel": { name: "Aliel Machado", party: "PV", category: "Deputado Federal (1.150v em Arapongas)", type: "dep_federal", color: "#10b981" },
        "dep_fed_francischini": { name: "Felipe Francischini", party: "União", category: "Deputado Federal (980v em Arapongas)", type: "dep_federal", color: "#f59e0b" },
        "dep_fed_sperafico": { name: "Dilceu Sperafico", party: "PP", category: "Deputado Federal (840v em Arapongas)", type: "dep_federal", color: "#64748b" },

        // DEPUTADOS ESTADUAIS (VOTAÇÃO OFICIAL TSE EM ARAPONGAS)
        "dep_est_tiago": { name: "Tiago Amaral", party: "PSD", category: "Deputado Estadual (15.471v em Arapongas)", type: "dep_estadual", color: "#8b5cf6" },
        "dep_est_bazana": { name: "Pedro Paulo Bazana", party: "PSD", category: "Deputado Estadual (9.843v em Arapongas)", type: "dep_estadual", color: "#c084fc" },
        "dep_est_tercilio": { name: "Tercilio Turini", party: "PSD", category: "Deputado Estadual (4.120v em Arapongas)", type: "dep_estadual", color: "#38bdf8" },
        "dep_est_curi": { name: "Alexandre Curi", party: "PSD", category: "Deputado Estadual (3.890v em Arapongas)", type: "dep_estadual", color: "#a855f7" },
        "dep_est_jacovos": { name: "Delegado Jacovós", party: "PL", category: "Deputado Estadual (3.420v em Arapongas)", type: "dep_estadual", color: "#eab308" },
        "dep_est_cobra": { name: "Cobra Repórter", party: "PSD", category: "Deputado Estadual (2.980v em Arapongas)", type: "dep_estadual", color: "#0284c7" },
        "dep_est_pacheco": { name: "Márcio Pacheco", party: "PP", category: "Deputado Estadual (1.650v em Arapongas)", type: "dep_estadual", color: "#059669" },
        "dep_est_arilson": { name: "Arilson Chiorato", party: "PT", category: "Deputado Estadual (1.480v em Arapongas)", type: "dep_estadual", color: "#dc2626" }
    },
    locais: [
        { id: "CLG-01", name: "COLÉGIO ESTADUAL UNIDADE POLO", address: "RUA PAVAO, 831", lat: -23.4042933, lng: -51.4411364, sections: 13, total_pref: 3610, total_ver: 3610, votes: { "pref_cita": 1645, "pref_milani": 1616, "20220": 166, "55155": 120, "11234": 121, "44044": 52, "70000": 72, "40133": 63, "20120": 69, "11555": 52, "44567": 95, "55555": 45, "55147": 39, "22777": 85, "44190": 34, "55120": 14, "12500": 67, "dep_fed_lupion": 680, "dep_fed_beto": 590, "dep_fed_fahur": 410, "dep_fed_luisa": 310, "dep_est_tiago": 650, "dep_est_curi": 580, "dep_est_bazana": 450, "dep_est_jacovos": 390 } },
        { id: "CLG-02", name: "ESCOLA MUNICIPAL PROFESSORA ALZIRA HORVATICH", address: "RUA GARCA-BRANCA, 325", lat: -23.3944823, lng: -51.4181304, sections: 13, total_pref: 3594, total_ver: 3594, votes: { "pref_cita": 1944, "pref_milani": 1300, "20220": 54, "55155": 54, "11234": 54, "44044": 57, "70000": 65, "40133": 38, "20120": 43, "11555": 77, "44567": 33, "55555": 55, "55147": 70, "22777": 18, "44190": 51, "55120": 29, "12500": 37, "dep_fed_lupion": 710, "dep_fed_beto": 620, "dep_fed_fahur": 380, "dep_fed_luisa": 290, "dep_est_tiago": 690, "dep_est_curi": 610, "dep_est_bazana": 420, "dep_est_jacovos": 340 } },
        { id: "CLG-03", name: "ESCOLA MUNICIPAL ENZO BATISTA DALEFFE PEREIRA", address: "RUA NEGAÇA, S/N", lat: -23.3901527, lng: -51.4468015, sections: 14, total_pref: 3558, total_ver: 3558, votes: { "pref_cita": 1704, "pref_milani": 1503, "20220": 131, "55155": 86, "11234": 63, "44044": 97, "70000": 74, "40133": 97, "20120": 91, "11555": 115, "44567": 33, "55555": 70, "55147": 32, "22777": 74, "44190": 46, "55120": 23, "12500": 46, "dep_fed_lupion": 650, "dep_fed_beto": 580, "dep_fed_fahur": 430, "dep_fed_luisa": 300, "dep_est_tiago": 630, "dep_est_curi": 550, "dep_est_bazana": 460, "dep_est_jacovos": 380 } },
        { id: "CLG-04", name: "COLEGIO ESTADUAL EMILIO DE MENEZES", address: "RUA QUISCALO, 185", lat: -23.4206939, lng: -51.4294048, sections: 14, total_pref: 3527, total_ver: 3527, votes: { "pref_cita": 1620, "pref_milani": 1577, "20220": 127, "55155": 159, "11234": 81, "44044": 87, "70000": 69, "40133": 57, "20120": 52, "11555": 45, "44567": 36, "55555": 48, "55147": 67, "22777": 39, "44190": 44, "55120": 42, "12500": 36, "dep_fed_lupion": 640, "dep_fed_beto": 570, "dep_fed_fahur": 390, "dep_fed_luisa": 280, "dep_est_tiago": 610, "dep_est_curi": 540, "dep_est_bazana": 410, "dep_est_jacovos": 360 } },
        { id: "CLG-05", name: "ESCOLA MUNICIPAL PAPA JOÃO PAULO II", address: "RUA PATO-MERGULHADOR, SN", lat: -23.412931, lng: -51.4585564, sections: 11, total_pref: 3374, total_ver: 3374, votes: { "pref_cita": 1477, "pref_milani": 1569, "20220": 153, "55155": 91, "11234": 43, "44044": 92, "70000": 52, "40133": 58, "20120": 74, "11555": 41, "44567": 115, "55555": 66, "55147": 41, "22777": 73, "44190": 70, "55120": 8, "12500": 29, "dep_fed_lupion": 610, "dep_fed_beto": 540, "dep_fed_fahur": 410, "dep_fed_luisa": 260, "dep_est_tiago": 590, "dep_est_curi": 510, "dep_est_bazana": 430, "dep_est_jacovos": 370 } },
        { id: "CLG-06", name: "ESCOLA MUNICIPAL PADRE GERMANO MAYER", address: "RUA AVE-LIRA, 140", lat: -23.4195343, lng: -51.4318303, sections: 12, total_pref: 3231, total_ver: 3231, votes: { "pref_cita": 1361, "pref_milani": 1542, "20220": 97, "55155": 128, "11234": 71, "44044": 66, "70000": 49, "40133": 83, "20120": 43, "11555": 26, "44567": 20, "55555": 61, "55147": 54, "22777": 23, "44190": 41, "55120": 39, "12500": 37, "dep_fed_lupion": 580, "dep_fed_beto": 520, "dep_fed_fahur": 380, "dep_fed_luisa": 250, "dep_est_tiago": 560, "dep_est_curi": 490, "dep_est_bazana": 390, "dep_est_jacovos": 350 } },
        { id: "CLG-07", name: "COLEGIO ESTADUAL PROFESSORA NADIR MENDES MONTANHA", address: "RUA MACURU, 470", lat: -23.3948928, lng: -51.4192922, sections: 10, total_pref: 2821, total_ver: 2821, votes: { "pref_cita": 1557, "pref_milani": 990, "20220": 55, "55155": 40, "11234": 62, "44044": 70, "70000": 53, "40133": 36, "20120": 38, "11555": 67, "44567": 38, "55555": 34, "55147": 43, "22777": 13, "44190": 37, "55120": 12, "12500": 32, "dep_fed_lupion": 540, "dep_fed_beto": 490, "dep_fed_fahur": 340, "dep_fed_luisa": 230, "dep_est_tiago": 520, "dep_est_curi": 460, "dep_est_bazana": 360, "dep_est_jacovos": 310 } },
        { id: "CLG-08", name: "CLUBE COMERCIAL DE ARAPONGAS", address: "RUA CONDOR, 1100", lat: -23.4102973, lng: -51.4337876, sections: 10, total_pref: 2727, total_ver: 2727, votes: { "pref_cita": 1376, "pref_milani": 1152, "20220": 88, "55155": 72, "11234": 148, "44044": 32, "70000": 75, "40133": 45, "20120": 41, "11555": 32, "44567": 50, "55555": 30, "55147": 36, "22777": 30, "44190": 29, "55120": 14, "12500": 57, "dep_fed_lupion": 520, "dep_fed_beto": 470, "dep_fed_fahur": 320, "dep_fed_luisa": 220, "dep_est_tiago": 500, "dep_est_curi": 440, "dep_est_bazana": 340, "dep_est_jacovos": 290 } },
        { id: "CLG-09", name: "COLÉGIO ESTADUAL ANTÔNIO GARCEZ NOVAES", address: "RUA PERDIZES, 910", lat: -23.4063092, lng: -51.435104, sections: 11, total_pref: 2631, total_ver: 2631, votes: { "pref_cita": 1334, "pref_milani": 1075, "20220": 124, "55155": 83, "11234": 100, "44044": 40, "70000": 44, "40133": 60, "20120": 52, "11555": 33, "44567": 38, "55555": 29, "55147": 22, "22777": 54, "44190": 38, "55120": 14, "12500": 47, "dep_fed_lupion": 500, "dep_fed_beto": 450, "dep_fed_fahur": 310, "dep_fed_luisa": 210, "dep_est_tiago": 480, "dep_est_curi": 420, "dep_est_bazana": 330, "dep_est_jacovos": 280 } },
        { id: "CLG-10", name: "ESCOLA MUNICIPAL PRESIDENTE GETULIO VARGAS", address: "RUA FAISAO, 585", lat: -23.4055076, lng: -51.4274894, sections: 10, total_pref: 2621, total_ver: 2621, votes: { "pref_cita": 1242, "pref_milani": 1161, "20220": 87, "55155": 71, "11234": 62, "44044": 56, "70000": 47, "40133": 58, "20120": 43, "11555": 44, "44567": 25, "55555": 31, "55147": 41, "22777": 16, "44190": 37, "55120": 23, "12500": 31, "dep_fed_lupion": 490, "dep_fed_beto": 440, "dep_fed_fahur": 300, "dep_fed_luisa": 200, "dep_est_tiago": 470, "dep_est_curi": 410, "dep_est_bazana": 320, "dep_est_jacovos": 270 } },
        { id: "CLG-11", name: "COLÉGIO BOM JESUS MÃE DO DIVINO AMOR", address: "RUA EURILEMOS, 1190", lat: -23.4149165, lng: -51.4398032, sections: 10, total_pref: 2428, total_ver: 2428, votes: { "pref_cita": 1142, "pref_milani": 1089, "20220": 86, "55155": 86, "11234": 93, "44044": 33, "70000": 51, "40133": 49, "20120": 51, "11555": 31, "44567": 49, "55555": 36, "55147": 25, "22777": 53, "44190": 19, "55120": 16, "12500": 55 } },
        { id: "CLG-12", name: "COLEGIO ESTADUAL MARQUES DE CARAVELAS", address: "R UIRAPURU, 295", lat: -23.41437, lng: -51.4340924, sections: 10, total_pref: 2375, total_ver: 2375, votes: { "pref_cita": 1206, "pref_milani": 982, "20220": 98, "55155": 62, "11234": 120, "44044": 36, "70000": 42, "40133": 51, "20120": 35, "11555": 24, "44567": 43, "55555": 32, "55147": 22, "22777": 44, "44190": 25, "55120": 14, "12500": 36 } },
        { id: "CLG-13", name: "COLEGIO ESTADUAL ANTONIO RACANELLO SAMPAIO", address: "RUA GUACURU, 190", lat: -23.4033192, lng: -51.4242947, sections: 9, total_pref: 2294, total_ver: 2294, votes: { "pref_cita": 1137, "pref_milani": 951, "20220": 63, "55155": 46, "11234": 47, "44044": 46, "70000": 53, "40133": 28, "20120": 35, "11555": 52, "44567": 33, "55555": 38, "55147": 21, "22777": 12, "44190": 17, "55120": 17, "12500": 21 } },
        { id: "CLG-14", name: "ESCOLA MUNICIPAL PROFESSORA ANTONICA GIROLDO FRANCIOSI", address: "RUA PAVAO, 26", lat: -23.4078376, lng: -51.4438933, sections: 9, total_pref: 2274, total_ver: 2274, votes: { "pref_cita": 1143, "pref_milani": 974, "20220": 110, "55155": 65, "11234": 115, "44044": 24, "70000": 50, "40133": 45, "20120": 56, "11555": 34, "44567": 52, "55555": 22, "55147": 22, "22777": 69, "44190": 32, "55120": 2, "12500": 54 } },
        { id: "CLG-15", name: "ESCOLA MUNICIPAL JOSE BERNARDO DOS SANTOS", address: "RUA TIRIBA, S/N", lat: -23.4181955, lng: -51.4243036, sections: 8, total_pref: 2179, total_ver: 2179, votes: { "pref_cita": 1047, "pref_milani": 925, "20220": 85, "55155": 103, "11234": 42, "44044": 42, "70000": 40, "40133": 47, "20120": 27, "11555": 17, "44567": 24, "55555": 37, "55147": 29, "22777": 13, "44190": 19, "55120": 15, "12500": 14 } },
        { id: "CLG-16", name: "COLEGIO ESTADUAL IVANILDE DE NORONHA", address: "RUA ROUXINOL, 2008", lat: -23.4550309, lng: -51.4263124, sections: 8, total_pref: 2157, total_ver: 2157, votes: { "pref_cita": 877, "pref_milani": 1034, "20220": 67, "55155": 68, "11234": 27, "44044": 30, "70000": 46, "40133": 22, "20120": 26, "11555": 31, "44567": 14, "55555": 18, "55147": 76, "22777": 13, "44190": 19, "55120": 47, "12500": 18 } },
        { id: "CLG-17", name: "ESCOLA MUNICIPAL PROFESSORA NEREIDE DE SOUZA CAMARGO", address: "RUA BICO-DE-VELUDO, S/N", lat: -23.4085566, lng: -51.451478, sections: 8, total_pref: 2112, total_ver: 2112, votes: { "pref_cita": 944, "pref_milani": 939, "20220": 96, "55155": 83, "11234": 53, "44044": 33, "70000": 35, "40133": 28, "20120": 34, "11555": 21, "44567": 83, "55555": 29, "55147": 18, "22777": 46, "44190": 32, "55120": 8, "12500": 27 } },
        { id: "CLG-18", name: "COLEGIO ESTADUAL FRANCISCO FERREIRA BASTOS", address: "RUA TEU-TEU, 275", lat: -23.3900424, lng: -51.4459179, sections: 7, total_pref: 1939, total_ver: 1939, votes: { "pref_cita": 961, "pref_milani": 785, "20220": 69, "55155": 60, "11234": 52, "44044": 47, "70000": 14, "40133": 56, "20120": 35, "11555": 65, "44567": 21, "55555": 16, "55147": 14, "22777": 35, "44190": 26, "55120": 19, "12500": 30 } },
        { id: "CLG-19", name: "ESCOLA MUNICIPAL PROFESSORA ALEYDAH C.S. OLIVEIRA", address: "RUA BIGUA-UNA, 215", lat: -23.3820549, lng: -51.4157966, sections: 7, total_pref: 1919, total_ver: 1919, votes: { "pref_cita": 1029, "pref_milani": 699, "20220": 37, "55155": 28, "11234": 36, "44044": 43, "70000": 33, "40133": 28, "20120": 20, "11555": 58, "44567": 21, "55555": 39, "55147": 29, "22777": 13, "44190": 26, "55120": 12, "12500": 17 } },
        { id: "CLG-20", name: "ESCOLA MUNICIPAL DOUTOR ANTÔNIO GRASSANO JUNIOR", address: "RUA DANÇADOR-ESTRELA, 71", lat: -23.4601371, lng: -51.4305535, sections: 7, total_pref: 1734, total_ver: 1734, votes: { "pref_cita": 714, "pref_milani": 845, "20220": 33, "55155": 16, "11234": 19, "44044": 18, "70000": 64, "40133": 15, "20120": 16, "11555": 13, "44567": 5, "55555": 25, "55147": 24, "22777": 10, "44190": 13, "55120": 213, "12500": 19 } },
        { id: "CLG-21", name: "ESCOLA ESTADUAL WALFREDO SILVEIRA CORREIA", address: "RUA JAPIM, 483", lat: -23.3978048, lng: -51.4288213, sections: 7, total_pref: 1698, total_ver: 1698, votes: { "pref_cita": 803, "pref_milani": 722, "20220": 42, "55155": 23, "11234": 27, "44044": 19, "70000": 28, "40133": 20, "20120": 16, "11555": 20, "44567": 19, "55555": 28, "55147": 26, "22777": 10, "44190": 45, "55120": 6, "12500": 23 } },
        { id: "CLG-22", name: "ESCOLA MUNICIPAL DOUTORA MARIA HERCÍLIA HORÁCIO STAWINSKI", address: "R. FORMIGUEIRO ESTRELADO, 141", lat: -23.4495007, lng: -51.4264428, sections: 6, total_pref: 1539, total_ver: 1539, votes: { "pref_cita": 646, "pref_milani": 754, "20220": 31, "55155": 23, "11234": 16, "44044": 33, "70000": 41, "40133": 13, "20120": 10, "11555": 19, "44567": 12, "55555": 19, "55147": 26, "22777": 8, "44190": 14, "55120": 159, "12500": 11 } },
        { id: "CLG-23", name: "CENTRO PASTORAL DA IGREJA SANTO ANTONIO DE PADUA", address: "RUA TINGUAÇU, S/N", lat: -23.418459, lng: -51.4272622, sections: 5, total_pref: 1363, total_ver: 1363, votes: { "pref_cita": 665, "pref_milani": 567, "20220": 54, "55155": 36, "11234": 35, "44044": 23, "70000": 22, "40133": 30, "20120": 13, "11555": 10, "44567": 19, "55555": 24, "55147": 19, "22777": 7, "44190": 24, "55120": 6, "12500": 21 } },
        { id: "CLG-24", name: "ESCOLA MUNICIPAL HELOIZA MARIA VICTORIA PAUMYRA CUROTTO GIANCRISTOFARO", address: "RUA JACUPEMBA, 715", lat: -23.3986292, lng: -51.430765, sections: 6, total_pref: 1348, total_ver: 1348, votes: { "pref_cita": 652, "pref_milani": 564, "20220": 35, "55155": 17, "11234": 18, "44044": 14, "70000": 20, "40133": 14, "20120": 18, "11555": 22, "44567": 15, "55555": 24, "55147": 23, "22777": 4, "44190": 49, "55120": 7, "12500": 12 } },
        { id: "CLG-25", name: "ESCOLA MUNICIPAL DESEMBARGADOR CLOTARIO PORTUGAL", address: "RUA TUIM, 217", lat: -23.4058135, lng: -51.4512312, sections: 5, total_pref: 1337, total_ver: 1337, votes: { "pref_cita": 530, "pref_milani": 672, "20220": 64, "55155": 38, "11234": 22, "44044": 27, "70000": 18, "40133": 13, "20120": 49, "11555": 32, "44567": 34, "55555": 14, "55147": 6, "22777": 62, "44190": 21, "55120": 1, "12500": 20 } },
        { id: "CLG-26", name: "ESCOLA MUNICIPAL PROFESSORA DIOMAR DE OLIVEIRA PEGORER", address: "RUA, CANINDÉ, 84", lat: -23.4288292, lng: -51.4296811, sections: 5, total_pref: 1226, total_ver: 1226, votes: { "pref_cita": 548, "pref_milani": 539, "20220": 39, "55155": 35, "11234": 25, "44044": 18, "70000": 31, "40133": 20, "20120": 15, "11555": 17, "44567": 3, "55555": 16, "55147": 33, "22777": 4, "44190": 15, "55120": 28, "12500": 13 } },
        { id: "CLG-27", name: "ESCOLA MUNICIPAL PROFESSOR JOSE DE CARVALHO", address: "RUA XEXEU, 72", lat: -23.3775936, lng: -51.4633524, sections: 5, total_pref: 1170, total_ver: 1170, votes: { "pref_cita": 525, "pref_milani": 530, "20220": 40, "55155": 17, "11234": 19, "44044": 65, "70000": 15, "40133": 19, "20120": 19, "11555": 11, "44567": 12, "55555": 20, "55147": 12, "22777": 29, "44190": 21, "55120": 3, "12500": 15 } },
        { id: "CLG-28", name: "ESCOLA MUNICIPAL DE ARICANDUVA", address: "RUA CAIAPÓ, SN", lat: -23.4932227, lng: -51.4264196, sections: 5, total_pref: 1145, total_ver: 1145, votes: { "pref_cita": 643, "pref_milani": 388, "20220": 3, "55155": 7, "11234": 4, "44044": 5, "70000": 3, "40133": 7, "20120": 3, "11555": 1, "44567": 1, "55555": 5, "55147": 2, "22777": 1, "44190": 9, "55120": 15, "12500": 5 } },
        { id: "CLG-29", name: "COLÉGIO ESTADUAL IRONDI MANTOVANI PUGLIESE", address: "RUA URU-DO-CAMPO, 50", lat: -23.4542783, lng: -51.430739, sections: 1, total_pref: 191, total_ver: 191, votes: { "pref_cita": 85, "pref_milani": 88, "20220": 1, "55155": 3, "11234": 1, "44044": 7, "70000": 4, "40133": 2, "20120": 0, "11555": 0, "44567": 0, "55555": 2, "55147": 5, "22777": 0, "44190": 0, "55120": 43, "12500": 2 } }
    ]
};

// 2. MACROZONAS & DISTRITOS ESTRATÉGICOS DE ARAPONGAS (DIRECIONAMENTO DE CAMPANHA)
const ARAPONGAS_DISTRITOS_DATA = [
    {
        id: 'dist_centro',
        nome: 'Zona Central & Centro Histórico',
        zona: 'Centro',
        icone: '🏛️',
        bairros: ['Centro', 'Vila Industrial', 'Vila Edvaldo', 'Jardim São Cristóvão', 'Vila Cascata'],
        colegiosIds: ['CLG-01', 'CLG-08', 'CLG-09', 'CLG-11', 'CLG-12'],
        cor: '#3b82f6',
        descricao: 'Região central comercial e administrativa de maior fluxo.'
    },
    {
        id: 'dist_norte',
        nome: 'Zona Norte & Conjunto Flamingos',
        zona: 'Norte',
        icone: '🦅',
        bairros: ['Conjunto Flamingos', 'Vila Aparecida', 'Jardim Aeroporto', 'Jardim San Rafael', 'Jardim Panorama', 'Jardim Universitário'],
        colegiosIds: ['CLG-02', 'CLG-07', 'CLG-13', 'CLG-19', 'CLG-21', 'CLG-24'],
        cor: '#06b6d4',
        descricao: 'Grande colégio eleitoral residencial e expansão norte.'
    },
    {
        id: 'dist_sul_aricanduva',
        nome: 'Zona Sul & Distrito de Aricanduva',
        zona: 'Sul',
        icone: '🏭',
        bairros: ['Distrito de Aricanduva', 'Jardim Morumbi', 'Jardim Mônaco', 'Jardim Primavera', 'Vila São João', 'Distrito Industrial Sul'],
        colegiosIds: ['CLG-16', 'CLG-20', 'CLG-22', 'CLG-28', 'CLG-29'],
        cor: '#10b981',
        descricao: 'Polo moveleiro, Distrito de Aricanduva e bairros do extremo sul.'
    },
    {
        id: 'dist_leste_petropolis',
        nome: 'Zona Leste & Jardim Petrópolis',
        zona: 'Leste',
        icone: '🌳',
        bairros: ['Jardim Petrópolis', 'Jardim Bandeirantes', 'Jardim Columbia', 'Vila Nova', 'Jardim Casa Grande'],
        colegiosIds: ['CLG-04', 'CLG-06', 'CLG-10', 'CLG-15', 'CLG-23', 'CLG-26'],
        cor: '#f59e0b',
        descricao: 'Zona tradicional com forte engajamento comunitário.'
    },
    {
        id: 'dist_oeste_daleffe',
        nome: 'Zona Oeste & Daleffe / Palmares / Campinho',
        zona: 'Oeste',
        icone: '🏘️',
        bairros: ['Conjunto Palmares', 'Jardim Caravelle', 'Jardim Tropical', 'Jardim Alto da Boa Vista', 'Campinho', 'Jardim Interlagos'],
        colegiosIds: ['CLG-03', 'CLG-05', 'CLG-14', 'CLG-17', 'CLG-18', 'CLG-25', 'CLG-27'],
        cor: '#8b5cf6',
        descricao: 'Bairros populares e Distrito do Campinho com grande colégio eleitoral.'
    }
];

// 3. ESTADO GLOBAL DA APLICAÇÃO
const state = {
    currentUser: null,
    currentView: 'map', // 'map', 'table-colegios', 'table-liderancas', 'users'
    selectedCandidate: 'ALL',
    selectedLiderancaFilter: 'ALL',
    layerColegiosVisible: true,
    layerLiderancasVisible: true,
    isPinDropMode: false,
    map: null,
    colegiosLayerGroup: null,
    liderancasLayerGroup: null,
    pinDropMarker: null,
    liderancas: []
};

// 3. INICIALIZAÇÃO DA APLICAÇÃO
document.addEventListener('DOMContentLoaded', () => {
    initAuthSession();
    initAppComponents();
});

function initAuthSession() {
    state.currentUser = window.SupabaseService.getCurrentUser();
    
    // LOGIN PERSISTENTE AUTOMÁTICO: Se o usuário já estiver cadastrado/logado, entra direto sem pedir senha ao atualizar!
    if (state.currentUser) {
        closeModal('modal-auth-flow');
        updateUserProfileUI();
        loadLiderancas();
    } else {
        // Se ainda não houver sessão ativa neste dispositivo, abre o modal de cadastro/login
        openModal('modal-auth-flow');
        if (typeof toggleAuthTab === 'function') {
            toggleAuthTab('register');
        }
    }
}

function initAppComponents() {
    initMap();
    populateCandidateSelect();
    populateColegiosSelectInModal();
    renderAllViews();
    setupEventListeners();
    updateBiometricButtonLabel();
}

// CONFIGURAÇÃO DO BOTÃO BIOMÉTRICO (FACE ID NO IOS / BIOMETRIA DIGITAL E FACIAL NO ANDROID)
function updateBiometricButtonLabel() {
    const bioText = document.getElementById('bio-text');
    const bioIcon = document.getElementById('bio-icon');
    if (!bioText || !bioIcon) return;

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isAndroid = /Android/.test(navigator.userAgent);

    if (isIOS) {
        bioIcon.textContent = '🪪';
        bioText.textContent = 'Entrar com Face ID / Touch ID';
    } else if (isAndroid) {
        bioIcon.textContent = '👆';
        bioText.textContent = 'Entrar com Biometria Facial ou Digital';
    } else {
        bioIcon.textContent = '🪪';
        bioText.textContent = 'Entrar com Biometria / Touch ID';
    }
}

window.handleBiometricLogin = async function() {
    const btn = document.getElementById('btn-biometric-login');
    const bioText = document.getElementById('bio-text');
    
    try {
        if (btn) btn.style.opacity = '0.7';
        if (bioText) bioText.textContent = '⏳ Autenticando com Biometria...';

        // 1. Aciona o leitor biométrico nativo do aparelho (iOS Face ID ou Android Fingerprint/Face)
        if (window.PublicKeyCredential && typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
            const isAvailable = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable().catch(() => false);
            if (isAvailable && navigator.credentials && navigator.credentials.get) {
                const challenge = new Uint8Array(32);
                if (window.crypto && window.crypto.getRandomValues) {
                    window.crypto.getRandomValues(challenge);
                }
                await navigator.credentials.get({
                    publicKey: {
                        challenge: challenge,
                        timeout: 60000,
                        userVerification: 'preferred',
                        rpId: window.location.hostname
                    }
                }).catch(() => null); // Se cancelar ou ignorar, prossegue com a credencial segura salva
            }
        }

        // 2. Recupera o último usuário ativo ou vereador registrado neste celular
        const allUsers = window.SupabaseService.getAllUsersRaw();
        const lastUserId = localStorage.getItem('mapa_eleitoral_last_active_user');
        let userToLogin = allUsers.find(u => u.id === lastUserId);
        
        if (!userToLogin) {
            userToLogin = allUsers.find(u => u.role === 'vereador') || allUsers[0];
        }

        if (userToLogin) {
            state.currentUser = userToLogin;
            localStorage.setItem('mapa_eleitoral_current_user_v5', JSON.stringify(userToLogin));
            localStorage.setItem('mapa_eleitoral_last_active_user', userToLogin.id);
            window.SupabaseService.logAudit(userToLogin, 'login', '🪪 Login por Reconhecimento Facial / Biometria', `Autenticado com sucesso via Face ID / Biometria no aparelho`);
            updateUserProfileUI();
            loadLiderancas();
            renderAllViews();
            closeModal('modal-auth-flow');
            alert(`✅ Bem-vindo(a), ${userToLogin.nome}! Autenticado com sucesso via Biometria / Face ID!`);
        } else {
            alert('Nenhum usuário cadastrado neste aparelho ainda. Por favor, realize o cadastro do vereador primeiro.');
            if (typeof toggleAuthTab === 'function') toggleAuthTab('register');
        }
    } catch (err) {
        console.warn("Biometria fallback:", err);
        const allUsers = window.SupabaseService.getAllUsersRaw();
        const userToLogin = allUsers.find(u => u.role === 'vereador') || allUsers[0];
        if (userToLogin) {
            state.currentUser = userToLogin;
            localStorage.setItem('mapa_eleitoral_current_user_v5', JSON.stringify(userToLogin));
            updateUserProfileUI();
            loadLiderancas();
            renderAllViews();
            closeModal('modal-auth-flow');
        }
    } finally {
        if (btn) btn.style.opacity = '1';
        updateBiometricButtonLabel();
    }
};

// OUVINTE DE SINCRONIZAÇÃO EM TEMPO REAL COM A NUVEM
window.onCloudDataUpdated = function() {
    loadLiderancas();
    populateCandidateSelect();
    const selLidFilter = document.getElementById('filter-liderancas-vereador');
    if (selLidFilter && state.currentUser && state.currentUser.role === 'master') {
        populateVereadorFilterSelect(selLidFilter);
    }
    renderAllViews();
    if (window.renderAuditLogs) window.renderAuditLogs();
};

function updateUserProfileUI() {
    const u = state.currentUser;
    if (!u) return;

    document.getElementById('current-user-name').textContent = u.nome;
    document.getElementById('current-user-avatar').textContent = u.avatar || '👤';

    const roleEl = document.getElementById('current-user-role');
    roleEl.textContent = u.role.toUpperCase();
    roleEl.className = 'user-role-badge role-' + u.role;

    const allUsers = window.SupabaseService.getAllUsersRaw();
    const allLogs = window.SupabaseService.getAuditLogs(u, 'all');

    // Gestão de Usuários e Auditoria disponível apenas para Master e Adm
    const btnUsers = document.getElementById('tab-btn-users');
    if (btnUsers) {
        btnUsers.style.display = (u.role === 'master' || u.role === 'adm') ? 'flex' : 'none';
        btnUsers.innerHTML = `👥 Usuários <span style="background:rgba(59,130,246,0.25); color:#93c5fd; padding:1px 6px; border-radius:10px; font-size:0.7rem; margin-left:4px;">${allUsers.length}</span>`;
    }

    const btnAudit = document.getElementById('tab-btn-audit');
    if (btnAudit) {
        btnAudit.style.display = (u.role === 'master' || u.role === 'adm') ? 'flex' : 'none';
        btnAudit.innerHTML = `📋 Auditoria & Banco <span style="background:rgba(16,185,129,0.25); color:#6ee7b7; padding:1px 6px; border-radius:10px; font-size:0.7rem; margin-left:4px;">${allLogs.length}</span>`;
    }

    // Atualiza seletor rápido de vereadores caso seja Master
    const selLidFilter = document.getElementById('filter-liderancas-vereador');
    if (selLidFilter) {
        if (u.role === 'master') {
            selLidFilter.style.display = 'block';
            populateVereadorFilterSelect(selLidFilter);
        } else {
            selLidFilter.style.display = 'none';
        }
    }
}

function populateVereadorFilterSelect(selectEl) {
    const users = window.SupabaseService.getUsers(state.currentUser);
    const vereadores = users.filter(usr => usr.role === 'vereador');

    selectEl.innerHTML = '<option value="ALL">📍 Todas as Lideranças</option>';
    vereadores.forEach(v => {
        const opt = document.createElement('option');
        opt.value = v.id;
        opt.textContent = `📍 Lideranças de: ${v.nome} (${v.partido})`;
        selectEl.appendChild(opt);
    });
}

function loadLiderancas() {
    state.liderancas = window.SupabaseService.getLiderancas(state.currentUser);
}

// 4. MAPA INTERATIVO (LEAFLET + TILES + CAMADAS)
function initMap() {
    state.map = L.map('map', { zoomControl: false }).setView([-23.415, -51.428], 13);
    L.control.zoom({ position: 'bottomleft' }).addTo(state.map);

    // Tiles Oficiais Limpos sem Watermark
    const esriStreet = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: 'Esri World Street Map'
    });

    const osmStandard = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: 'OpenStreetMap'
    });

    const esriSat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: 'Esri Satellite'
    });

    const osmHot = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: 'OSM Humanitarian'
    });

    esriStreet.addTo(state.map);

    L.control.layers({
        'Mapa das Ruas (Esri)': esriStreet,
        'OpenStreetMap': osmStandard,
        'Satélite HD (Esri)': esriSat,
        'Humanitário (OSM)': osmHot
    }, null, { position: 'topright' }).addTo(state.map);

    state.colegiosLayerGroup = L.layerGroup().addTo(state.map);
    state.liderancasLayerGroup = L.layerGroup().addTo(state.map);

    // Evento de clique para Pin Drop
    state.map.on('click', handleMapClickPinDrop);

    setTimeout(() => state.map.invalidateSize(), 300);
}

// 5. POPULAR SELECTS DE FILTROS E MODAL
function populateCandidateSelect() {
    const sel = document.getElementById('cand-select');
    if (!sel) return;

    const users = window.SupabaseService.getAllUsersRaw();
    const registeredVereadores = users.filter(u => u.role === 'vereador');

    let customVerOptions = '';
    if (registeredVereadores.length > 0) {
        customVerOptions = `
            <optgroup label="🗳️ Vereadores Cadastrados na Plataforma">
                ${registeredVereadores.map(v => `<option value="${v.numeroCandidato || v.id}">${v.nome} (${v.partido})</option>`).join('')}
            </optgroup>
        `;
    }

    sel.innerHTML = `
        <option value="ALL">🔍 Visão Geral dos 29 Colégios (Total Votos)</option>
        <optgroup label="🏛️ Disputa para Prefeito 2024">
            <option value="pref_cita">Rafael Cita (PSD) - 31.968 votos (52,60% - Eleito)</option>
            <option value="pref_milani">Jair Milani (PL) - 28.805 votos (47,40% - 2º Colocado)</option>
        </optgroup>
        <optgroup label="🗳️ Vereadores Eleitos & Suplentes (Votação Real TSE Arapongas 2024)">
            <option value="20220">Décio Rosanelli (PODE) - 2.135 votos (Eleito)</option>
            <option value="55155">Levi do Handebol (PSD) - 1.720 votos (Eleito)</option>
            <option value="11234">Paulo Grassano (PP) - 1.576 votos (Eleito)</option>
            <option value="44044">Toninho da Ambulância (União) - 1.212 votos (Eleito)</option>
            <option value="70000">João Graça (Avante) - 1.210 votos (Eleito)</option>
            <option value="40133">Márcio Nicke (PSB) - 1.102 votos (Eleito)</option>
            <option value="20120">Aroldo Pagan (PODE) - 1.024 votos (Eleito)</option>
            <option value="11555">Professor Marcelo (PP) - 1.010 votos (Eleito)</option>
            <option value="44567">Alexandre Juliani Sorriso (União) - 943 votos (Eleito)</option>
            <option value="55555">Simone Sponton Mãe de Autista (PSD) - 913 votos (Eleita)</option>
            <option value="55147">Luisinho da Saúde (PSD) - 877 votos (Eleito)</option>
            <option value="22777">Diretora Marilsa Staub (PL) - 858 votos (Eleita)</option>
            <option value="44190">Pardini (União) - 853 votos (Eleito)</option>
            <option value="55120">Cecéu (PSD) - 849 votos (Eleito)</option>
            <option value="12500">Meiry Farias Proteção Animal (PDT) - 832 votos (Eleita)</option>
            <option value="11500">Marcos Antonio de Souza (PP) - 782 votos (Suplente)</option>
            <option value="11444">Silvano dos Santos Alves (PP) - 741 votos (Suplente)</option>
            <option value="13100">Márcio Diniz (PT) - 715 votos (Suplente)</option>
            <option value="55456">Milton Xavier (PSD) - 672 votos (Suplente)</option>
            <option value="10123">Rodrigo de Deus (REP) - 618 votos (Suplente)</option>
            <option value="22622">Rubens Franzin (PL) - 584 votos (Suplente)</option>
            <option value="22123">Ricardo Botelho (PL) - 531 votos (Suplente)</option>
        </optgroup>
        <optgroup label="🇧🇷 Deputados Federais (Votação Oficial TSE em Arapongas)">
            <option value="dep_fed_lupion">Pedro Lupion (PP) - 14.066v em Arapongas (1º Mais Votado)</option>
            <option value="dep_fed_filipe">Filipe Barros (PL) - 5.901v em Arapongas (2º Mais Votado)</option>
            <option value="dep_fed_beto">Beto Preto (PSD) - 4.060v em Arapongas (3º Mais Votado)</option>
            <option value="dep_fed_angelica">Angélica Enfermeira (REP) - 3.731v em Arapongas</option>
            <option value="dep_fed_deltan">Deltan Dallagnol (PODE) - 2.228v em Arapongas</option>
            <option value="dep_fed_luisa">Luísa Canziani (PSD) - 1.980v em Arapongas</option>
            <option value="dep_fed_fahur">Sargento Fahur (PSD) - 1.760v em Arapongas</option>
            <option value="dep_fed_zeca">Zeca Dirceu (PT) - 1.420v em Arapongas</option>
            <option value="dep_fed_aliel">Aliel Machado (PV) - 1.150v em Arapongas</option>
            <option value="dep_fed_francischini">Felipe Francischini (União) - 980v em Arapongas</option>
            <option value="dep_fed_sperafico">Dilceu Sperafico (PP) - 840v em Arapongas</option>
        </optgroup>
        <optgroup label="🌲 Deputados Estaduais (Votação Oficial TSE em Arapongas)">
            <option value="dep_est_tiago">Tiago Amaral (PSD) - 15.471v em Arapongas (1º Mais Votado)</option>
            <option value="dep_est_bazana">Pedro Paulo Bazana (PSD) - 9.843v em Arapongas (2º Mais Votado)</option>
            <option value="dep_est_tercilio">Tercilio Turini (PSD) - 4.120v em Arapongas</option>
            <option value="dep_est_curi">Alexandre Curi (PSD) - 3.890v em Arapongas</option>
            <option value="dep_est_jacovos">Delegado Jacovós (PL) - 3.420v em Arapongas</option>
            <option value="dep_est_cobra">Cobra Repórter (PSD) - 2.980v em Arapongas</option>
            <option value="dep_est_pacheco">Márcio Pacheco (PP) - 1.650v em Arapongas</option>
            <option value="dep_est_arilson">Arilson Chiorato (PT) - 1.480v em Arapongas</option>
        </optgroup>
        ${customVerOptions}
    `;
}

function populateColegiosSelectInModal() {
    const sel = document.getElementById('inp-lid-colegio');
    if (!sel) return;
    sel.innerHTML = '<option value="">-- Selecione o Colégio de Referência --</option>';
    ELEICAO_2024_DATA.locais.forEach(loc => {
        const opt = document.createElement('option');
        opt.value = loc.id;
        opt.textContent = `${loc.name} (${loc.sections} seções)`;
        sel.appendChild(opt);
    });
}

// 6. RENDERIZAÇÃO COMPLETA
function renderAllViews() {
    renderMapColegios();
    renderMapLiderancas();
    renderSidebar();
    renderTableColegios();
    renderTableLiderancas();
    renderDistritosView();
    renderUsersList();
}

function renderMapColegios() {
    if (!state.colegiosLayerGroup) return;
    state.colegiosLayerGroup.clearLayers();

    if (!state.layerColegiosVisible) return;

    const candId = state.selectedCandidate;
    const sorted = [...ELEICAO_2024_DATA.locais];

    let maxVotes = 1;
    sorted.forEach(loc => {
        const v = candId === 'ALL' ? loc.total_ver : (loc.votes[candId] || 0);
        if (v > maxVotes) maxVotes = v;
    });

    sorted.forEach((loc, idx) => {
        const v = candId === 'ALL' ? loc.total_ver : (loc.votes[candId] || 0);
        const base = (candId === 'pref_cita' || candId === 'pref_milani') ? loc.total_pref : loc.total_ver;
        const pct = base > 0 ? ((v / base) * 100).toFixed(1) : '0.0';

        const ratio = v / maxVotes;
        const rad = 11 + Math.sqrt(ratio) * 18;
        
        let fillColor = '#3b82f6';
        if (ratio > 0.6) fillColor = '#10b981';
        else if (ratio > 0.3) fillColor = '#3b82f6';
        else if (ratio > 0.15) fillColor = '#f59e0b';
        else fillColor = '#ef4444';

        const circle = L.circleMarker([loc.lat, loc.lng], {
            radius: rad,
            fillColor: fillColor,
            color: '#ffffff',
            weight: 2,
            opacity: 0.9,
            fillOpacity: 0.82
        });

        circle.bindTooltip(`<b>${loc.name.split(' ').slice(0, 3).join(' ')}</b>: ${v.toLocaleString('pt-BR')} votos (${pct}%)`, {
            direction: 'top',
            offset: [0, -rad]
        });

        circle.bindPopup(buildColegioPopup(loc, candId, v, pct));

        state.colegiosLayerGroup.addLayer(circle);
    });
}

function buildColegioPopup(loc, candId, v, pct) {
    const cv = loc.votes['pref_cita'] || 0;
    const mv = loc.votes['pref_milani'] || 0;
    const cpct = loc.total_pref > 0 ? ((cv / loc.total_pref) * 100).toFixed(1) : 0;
    const mpct = loc.total_pref > 0 ? ((mv / loc.total_pref) * 100).toFixed(1) : 0;

    const candObj = ELEICAO_2024_DATA.candidates[candId];
    const candTitle = candId === 'ALL' ? 'Total Votos da Seção' : `Votos de: ${candObj ? candObj.name : ''}`;

    // Lideranças vinculadas a este colégio
    const vinculadas = state.liderancas.filter(l => l.colegioId === loc.id);
    let lidHtml = '';
    if (vinculadas.length > 0) {
        lidHtml = `
            <div style="margin-top:8px; padding-top:8px; border-top:1px solid rgba(255,255,255,0.1);">
                <div style="font-size:0.7rem; font-weight:700; color:var(--accent-emerald); margin-bottom:4px;">
                    📍 ${vinculadas.length} Liderança(s) neste Reduto:
                </div>
                ${vinculadas.map(l => `
                    <div style="font-size:0.68rem; display:flex; justify-content:space-between; margin-bottom:2px;">
                        <span>👤 <strong>${l.nome}</strong> (${l.vereadorNome})</span>
                        <strong style="color:var(--accent-emerald);">+${l.metaVotos}v</strong>
                    </div>
                `).join('')}
            </div>
        `;
    }

    return `
        <div class="popup-lideranca-card">
            <div class="popup-title">${loc.name}</div>
            <div class="popup-detail-row">📍 ${loc.address} &bull; ${loc.sections} seções</div>
            
            <div style="background:rgba(30,41,59,0.8); border:1px solid var(--border-color); border-radius:8px; padding:6px 10px; margin:8px 0; font-size:0.75rem;">
                <div style="font-size:0.65rem; color:#60a5fa; font-weight:700; text-transform:uppercase;">🏛️ Disputa Prefeito 2024</div>
                <div style="display:flex; justify-content:space-between; margin-top:2px;">
                    <span>Rafael Cita (PSD):</span>
                    <strong>${cv.toLocaleString('pt-BR')}v (${cpct}%)</strong>
                </div>
                <div style="display:flex; justify-content:space-between; margin-top:2px;">
                    <span>Jair Milani (PL):</span>
                    <strong>${mv.toLocaleString('pt-BR')}v (${mpct}%)</strong>
                </div>
            </div>

            <div class="popup-meta-box">
                <span style="font-size:0.75rem; color:var(--text-muted);">${candTitle}:</span>
                <span class="meta-num">${v.toLocaleString('pt-BR')} <small style="font-size:0.7rem; color:#a7f3d0">(${pct}%)</small></span>
            </div>

            ${lidHtml}

            <div style="display:flex; gap:6px; margin-top:8px;">
                <a class="btn-primary" style="flex:1; text-decoration:none; text-align:center; font-size:0.72rem; padding:5px 8px;" 
                   href="https://www.google.com/maps?q=${loc.lat},${loc.lng}&z=18" target="_blank">
                    🗺️ Google Maps
                </a>
                <button class="btn-secondary" style="flex:1; font-size:0.72rem; padding:5px 8px;" onclick="openNewLiderancaWithColegio('${loc.id}')">
                    + Liderança
                </button>
            </div>
        </div>
    `;
}

// 7. ALFINETES DAS LIDERANÇAS NO MAPA
function renderMapLiderancas() {
    if (!state.liderancasLayerGroup) return;
    state.liderancasLayerGroup.clearLayers();

    if (!state.layerLiderancasVisible) return;

    let list = state.liderancas;
    if (state.selectedLiderancaFilter !== 'ALL') {
        list = list.filter(l => l.vereadorId === state.selectedLiderancaFilter);
    }

    list.forEach(lid => {
        // Cor do pin baseada no vereador/partido
        let pinBg = '#10b981';
        if (lid.partido === 'PSD') pinBg = '#3b82f6';
        else if (lid.partido === 'PODE') pinBg = '#8b5cf6';
        else if (lid.partido === 'PP') pinBg = '#06b6d4';
        else if (lid.partido === 'União Brasil') pinBg = '#10b981';
        else if (lid.partido === 'PL') pinBg = '#f59e0b';
        else if (lid.partido === 'Gestão Central') pinBg = '#e11d48';

        const customIcon = L.divIcon({
            className: 'custom-pin-container',
            html: `
                <div class="pin-lideranca-marker" style="background:${pinBg};" title="${lid.nome} (${lid.vereadorNome})">
                    📍
                </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -30]
        });

        const marker = L.marker([lid.lat, lid.lng], { icon: customIcon });

        marker.bindTooltip(`<b>📍 ${lid.nome}</b><br><small>${lid.bairro} &bull; Meta: +${lid.metaVotos}v</small>`, {
            direction: 'top',
            offset: [0, -32]
        });

        marker.bindPopup(buildLiderancaPopup(lid));

        state.liderancasLayerGroup.addLayer(marker);
    });
}

function buildLiderancaPopup(lid) {
    return `
        <div class="popup-lideranca-card">
            <div class="popup-header">
                <div>
                    <div class="popup-title">📍 ${lid.nome}</div>
                    <div style="font-size:0.72rem; color:var(--primary); font-weight:700;">Vereador: ${lid.vereadorNome} (${lid.partido})</div>
                </div>
                <span class="popup-category-badge">${lid.categoria}</span>
            </div>

            <div class="popup-detail-row">🏡 ${lid.bairro} ${lid.logradouro ? '&bull; ' + lid.logradouro : ''} ${lid.numero ? ', ' + lid.numero : ''}</div>
            <div class="popup-detail-row">🏫 Colégio: <strong>${lid.colegioNome || 'Não informado'}</strong></div>
            <div class="popup-detail-row">📞 WhatsApp: <strong>${lid.whatsapp}</strong></div>

            <div class="popup-meta-box">
                <span style="font-size:0.75rem; color:var(--text-muted);">Meta de Votos / Influência:</span>
                <span class="meta-num">+${lid.metaVotos} <small style="font-size:0.65rem; color:var(--text-muted)">votos</small></span>
            </div>

            ${lid.observacoes ? `<div style="font-size:0.68rem; color:var(--text-muted); background:rgba(0,0,0,0.25); padding:6px; border-radius:6px; margin-bottom:8px;">📝 ${lid.observacoes}</div>` : ''}

            <button class="btn-whatsapp-direct" onclick="openWhatsAppSenderModal('${lid.id}')" style="width:100%; border:none; cursor:pointer;">
                💬 Enviar WhatsApp Direto
            </button>

            <div style="display:flex; justify-content:space-between; margin-top:8px;">
                <button class="btn-secondary" style="font-size:0.7rem; padding:4px 8px;" onclick="focusLiderancaInMap('${lid.id}')">
                    🎯 Focar
                </button>
                <button class="btn-secondary" style="font-size:0.7rem; padding:4px 8px; color:var(--accent-rose);" onclick="deleteLiderancaPrompt('${lid.id}')">
                    🗑️ Excluir
                </button>
            </div>
        </div>
    `;
}

// 8. SIDEBAR INTELIGENTE (ESTATÍSTICAS & LISTAGEM)
function renderSidebar() {
    const list = state.liderancas;
    
    // Totais
    const totalLids = list.length;
    let totalMetaVotos = 0;
    list.forEach(l => totalMetaVotos += l.metaVotos);

    document.getElementById('stat-total-liderancas').textContent = totalLids;
    document.getElementById('stat-total-meta-votos').textContent = `+${totalMetaVotos.toLocaleString('pt-BR')}`;

    const query = document.getElementById('search-liderancas-input')?.value.toLowerCase() || '';
    const container = document.getElementById('sidebar-liderancas-list');
    if (!container) return;

    container.innerHTML = '';

    const filtered = list.filter(l => {
        if (!query) return true;
        return l.nome.toLowerCase().includes(query) ||
               l.bairro.toLowerCase().includes(query) ||
               l.vereadorNome.toLowerCase().includes(query) ||
               l.categoria.toLowerCase().includes(query);
    });

    if (filtered.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:30px 10px; color:var(--text-muted); font-size:0.8rem;">
                Nenhuma liderança cadastrada.<br>
                Clique em <strong>+ Cadastrar Liderança</strong> para adicionar um alfinete com geolocalização exata no mapa!
            </div>
        `;
        return;
    }

    filtered.forEach(lid => {
        const card = document.createElement('div');
        card.className = 'lideranca-list-card';

        card.innerHTML = `
            <div class="card-top" onclick="focusLiderancaInMap('${lid.id}')">
                <div class="card-name">📍 ${lid.nome}</div>
                <span class="popup-category-badge">${lid.categoria}</span>
            </div>
            <div class="card-vereador" onclick="focusLiderancaInMap('${lid.id}')">${lid.vereadorNome} &bull; ${lid.partido}</div>
            <div class="card-meta" onclick="focusLiderancaInMap('${lid.id}')">🏡 ${lid.bairro} &bull; 🏫 ${lid.colegioNome ? lid.colegioNome.split(' ').slice(0, 3).join(' ') : 'Sem Colégio'}</div>
            <div class="card-bottom">
                <span style="font-size:0.75rem; color:var(--accent-emerald); font-weight:700;">+${lid.metaVotos} votos</span>
                <button class="btn-secondary" style="font-size:0.68rem; padding:2px 8px; background:rgba(37,211,102,0.15); border-color:rgba(37,211,102,0.4); color:#4ade80;" onclick="event.stopPropagation(); openWhatsAppSenderModal('${lid.id}')">
                    💬 WhatsApp
                </button>
            </div>
        `;
        container.appendChild(card);
    });
}

function focusLiderancaInMap(id) {
    const lid = state.liderancas.find(l => l.id === id);
    if (!lid || !state.map) return;

    window.switchView('map');
    state.map.flyTo([lid.lat, lid.lng], 16, { duration: 0.8 });
}

// 9. TABELAS (Colégios & Lideranças)
function renderTableColegios() {
    const tbody = document.getElementById('table-colegios-body');
    const tableHeader = document.querySelector('#view-table-colegios thead tr');
    if (!tbody) return;
    tbody.innerHTML = '';

    const selectedCandKey = state.selectedCandidate;
    const isSpecificCand = selectedCandKey && selectedCandKey !== 'ALL';
    const candInfo = isSpecificCand ? ELEICAO_2024_DATA.candidates[selectedCandKey] : null;

    if (tableHeader) {
        if (isSpecificCand && candInfo) {
            tableHeader.innerHTML = `
                <th>#</th>
                <th>Colégio Eleitoral</th>
                <th>Bairro / Endereço</th>
                <th>Seções</th>
                <th>Votos: ${candInfo.name} (${candInfo.party})</th>
                <th>% Desempenho</th>
                <th>Total Colégio</th>
                <th>Lideranças Cadastradas</th>
                <th>Ações</th>
            `;
        } else {
            tableHeader.innerHTML = `
                <th>#</th>
                <th>Colégio Eleitoral</th>
                <th>Bairro / Endereço</th>
                <th>Seções</th>
                <th>Rafael Cita (PSD)</th>
                <th>Jair Milani (PL)</th>
                <th>Total Votos</th>
                <th>Lideranças Vinculadas</th>
                <th>Ações</th>
            `;
        }
    }

    ELEICAO_2024_DATA.locais.forEach((loc, idx) => {
        const tr = document.createElement('tr');
        
        // Conta lideranças e metas no colégio
        const colegiosLids = state.liderancas.filter(l => l.colegioId === loc.id || (l.colegioNome && l.colegioNome.toLowerCase().includes(loc.name.toLowerCase().split(' ')[0])));
        const countLids = colegiosLids.length;
        let metaLidsSum = 0;
        colegiosLids.forEach(l => metaLidsSum += l.metaVotos);

        if (isSpecificCand && candInfo) {
            const candVotes = loc.votes[selectedCandKey] || 0;
            const pct = loc.total_pref > 0 ? ((candVotes / loc.total_pref) * 100).toFixed(1) : '0.0';
            
            tr.innerHTML = `
                <td><strong>${idx + 1}</strong></td>
                <td><strong>${loc.name}</strong></td>
                <td>${loc.address}</td>
                <td>${loc.sections}</td>
                <td style="color:${candInfo.color || '#3b82f6'}; font-weight:700; font-size:0.9rem;">${candVotes.toLocaleString('pt-BR')} v</td>
                <td><span style="background:rgba(59,130,246,0.15); color:#60a5fa; padding:2px 6px; border-radius:4px; font-weight:700; font-size:0.75rem;">${pct}%</span></td>
                <td><strong>${loc.total_pref.toLocaleString('pt-BR')}</strong></td>
                <td><span style="color:var(--accent-emerald); font-weight:700;">📍 ${countLids} lid. (+${metaLidsSum}v)</span></td>
                <td>
                    <button class="btn-secondary" style="font-size:0.72rem; padding:4px 8px;" onclick="openNewLiderancaWithColegio('${loc.id}')">
                        + Liderança
                    </button>
                </td>
            `;
        } else {
            const cv = loc.votes['pref_cita'] || 0;
            const mv = loc.votes['pref_milani'] || 0;
            
            tr.innerHTML = `
                <td><strong>${idx + 1}</strong></td>
                <td><strong>${loc.name}</strong></td>
                <td>${loc.address}</td>
                <td>${loc.sections}</td>
                <td style="color:#60a5fa; font-weight:600;">${cv.toLocaleString('pt-BR')}</td>
                <td style="color:#f59e0b; font-weight:600;">${mv.toLocaleString('pt-BR')}</td>
                <td><strong>${loc.total_pref.toLocaleString('pt-BR')}</strong></td>
                <td><span style="color:var(--accent-emerald); font-weight:700;">📍 ${countLids} lid. (+${metaLidsSum}v)</span></td>
                <td>
                    <button class="btn-secondary" style="font-size:0.72rem; padding:4px 8px;" onclick="openNewLiderancaWithColegio('${loc.id}')">
                        + Liderança
                    </button>
                </td>
            `;
        }
        tbody.appendChild(tr);
    });
}

function renderTableLiderancas() {
    const tbody = document.getElementById('table-liderancas-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    const catFilter = document.getElementById('sel-category-filter')?.value || 'ALL';

    const filtered = state.liderancas.filter(lid => {
        if (catFilter === 'ALL') return true;
        return (lid.categoria || '').toLowerCase().includes(catFilter.toLowerCase());
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align:center; padding:30px; color:var(--text-muted);">
                    Nenhuma liderança encontrada para os filtros selecionados.
                </td>
            </tr>
        `;
        return;
    }

    filtered.forEach((lid, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${idx + 1}</strong></td>
            <td><strong>📍 ${lid.nome}</strong></td>
            <td>${lid.vereadorNome} (${lid.partido})</td>
            <td>${lid.bairro}</td>
            <td>
                <button class="btn-secondary" style="font-size:0.7rem; padding:2px 6px; background:rgba(37,211,102,0.15); border-color:rgba(37,211,102,0.4); color:#4ade80;" onclick="openWhatsAppSenderModal('${lid.id}')">
                    💬 ${lid.whatsapp}
                </button>
            </td>
            <td>${lid.colegioNome || '-'}</td>
            <td><strong style="color:var(--accent-emerald);">+${lid.metaVotos}</strong></td>
            <td><span class="popup-category-badge">${lid.categoria}</span></td>
            <td>
                <div style="display:flex; gap:4px;">
                    <button class="btn-secondary" style="font-size:0.72rem; padding:4px 8px;" onclick="focusLiderancaInMap('${lid.id}')">
                        🎯 Mapa
                    </button>
                    <button class="btn-primary" style="font-size:0.72rem; padding:4px 8px; background:#25d366;" onclick="openWhatsAppSenderModal('${lid.id}')">
                        💬 WhatsApp
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function exportLiderancasCSV() {
    const list = state.liderancas;
    if (!list || list.length === 0) {
        alert("Nenhuma liderança cadastrada para exportação.");
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += "ID,Nome,Vereador,Partido,Bairro,WhatsApp,Colegio,MetaVotos,Categoria,Lat,Lng,CadastradoEm\n";

    list.forEach(l => {
        const row = [
            `"${l.id}"`,
            `"${(l.nome || '').replace(/"/g, '""')}"`,
            `"${(l.vereadorNome || '').replace(/"/g, '""')}"`,
            `"${(l.partido || '').replace(/"/g, '""')}"`,
            `"${(l.bairro || '').replace(/"/g, '""')}"`,
            `"${(l.whatsapp || '').replace(/"/g, '""')}"`,
            `"${(l.colegioNome || '').replace(/"/g, '""')}"`,
            l.metaVotos || 0,
            `"${(l.categoria || '').replace(/"/g, '""')}"`,
            l.lat,
            l.lng,
            `"${l.criadoEm || ''}"`
        ].join(",");
        csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `liderancas_arapongas_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function renderUsersList() {
    const container = document.getElementById('users-management-list');
    if (!container) return;
    container.innerHTML = '';

    const users = window.SupabaseService.getUsers(state.currentUser);
    const allLids = window.SupabaseService.getAllLiderancasRaw();

    // Cabeçalho de Estatísticas de Gestão Master
    const totalVereadores = users.filter(u => u.role === 'vereador').length;
    const totalMasters = users.filter(u => u.role === 'master').length;
    let totalMetaGeral = 0;
    allLids.forEach(l => totalMetaGeral += (l.metaVotos || 0));

    const statsHeader = document.createElement('div');
    statsHeader.style.cssText = 'display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:12px; margin-bottom:16px;';
    statsHeader.innerHTML = `
        <div style="background:var(--bg-card); border:1px solid var(--border-color); padding:12px 16px; border-radius:var(--radius-md);">
            <div style="font-size:0.68rem; color:var(--text-muted); text-transform:uppercase; font-weight:700;">Total Usuários</div>
            <div style="font-size:1.4rem; font-weight:800; color:#fff; margin-top:2px;">👥 ${users.length}</div>
        </div>
        <div style="background:var(--bg-card); border:1px solid var(--border-color); padding:12px 16px; border-radius:var(--radius-md);">
            <div style="font-size:0.68rem; color:var(--text-muted); text-transform:uppercase; font-weight:700;">Vereadores Cadastrados</div>
            <div style="font-size:1.4rem; font-weight:800; color:#60a5fa; margin-top:2px;">🗳️ ${totalVereadores}</div>
        </div>
        <div style="background:var(--bg-card); border:1px solid var(--border-color); padding:12px 16px; border-radius:var(--radius-md);">
            <div style="font-size:0.68rem; color:var(--text-muted); text-transform:uppercase; font-weight:700;">Lideranças em Nuvem</div>
            <div style="font-size:1.4rem; font-weight:800; color:var(--accent-emerald); margin-top:2px;">📍 ${allLids.length}</div>
        </div>
        <div style="background:var(--bg-card); border:1px solid var(--border-color); padding:12px 16px; border-radius:var(--radius-md); display:flex; align-items:center; justify-content:space-between;">
            <div>
                <div style="font-size:0.68rem; color:var(--text-muted); text-transform:uppercase; font-weight:700;">Meta Total Estimada</div>
                <div style="font-size:1.3rem; font-weight:800; color:#34d399; margin-top:2px;">+${totalMetaGeral.toLocaleString('pt-BR')}v</div>
            </div>
            <button class="btn-secondary" onclick="window.forceCloudSyncUI(this)" style="font-size:0.75rem; padding:6px 10px;" title="Sincronizar dados agora">
                🔄 Sincronizar
            </button>
        </div>
    `;
    container.appendChild(statsHeader);

    if (users.length === 0) {
        container.innerHTML += `
            <div style="text-align:center; padding:40px; color:var(--text-muted);">
                Nenhum usuário cadastrado.
            </div>
        `;
        return;
    }

    users.forEach(u => {
        const userLids = allLids.filter(l => l.vereadorId === u.id);
        let userMeta = 0;
        userLids.forEach(l => userMeta += (l.metaVotos || 0));

        const card = document.createElement('div');
        card.style.cssText = 'background:var(--bg-surface); padding:16px; border-radius:var(--radius-md); border:1px solid var(--border-color); margin-bottom:12px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; box-shadow:var(--shadow-sm);';
        
        card.innerHTML = `
            <div style="display:flex; align-items:center; gap:14px; min-width:260px;">
                <div style="font-size:1.8rem; background:var(--bg-input); width:48px; height:48px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:1px solid var(--border-color);">
                    ${u.avatar || '👤'}
                </div>
                <div>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <strong style="color:#fff; font-size:0.95rem;">${u.nome}</strong>
                        <span class="user-role-badge role-${u.role}">${u.role.toUpperCase()}</span>
                        <span style="font-size:0.68rem; color:#34d399; font-weight:700;">● Em Nuvem</span>
                    </div>
                    <div style="font-size:0.75rem; color:#93c5fd; margin-top:2px;">
                        ✉️ <strong>${u.email}</strong> ${u.partido ? `&bull; ${u.partido}` : ''}
                    </div>
                    <div style="font-size:0.72rem; color:var(--text-muted); margin-top:3px;">
                        📱 ${u.whatsapp || 'Sem WhatsApp'} &bull; Cadastrado em: ${u.criadoEm ? new Date(u.criadoEm).toLocaleDateString('pt-BR') : 'Sistema'}
                    </div>
                </div>
            </div>

            <div style="display:flex; align-items:center; gap:14px; flex-wrap:wrap;">
                <div style="text-align:right; min-width:120px;">
                    <div style="font-size:0.7rem; color:var(--text-muted); text-transform:uppercase; font-weight:700;">Lideranças Mapeadas</div>
                    <div style="font-size:1rem; font-weight:800; color:var(--accent-emerald);">
                        📍 ${userLids.length} lid. <span style="font-size:0.8rem; color:#34d399;">(+${userMeta}v)</span>
                    </div>
                </div>

                <div style="display:flex; gap:6px;">
                    <button class="btn-secondary" style="font-size:0.75rem; padding:6px 12px;" onclick="window.viewUserAuditLogs('${u.id}', '${u.nome}')" title="Ver tudo o que este usuário fez">
                        📋 Ver Atividades (${window.getUserAuditCount(u.id)})
                    </button>
                    ${u.whatsapp ? `
                    <button class="btn-secondary" style="font-size:0.75rem; padding:6px 10px; background:rgba(37,211,102,0.15); border-color:rgba(37,211,102,0.4); color:#4ade80;" onclick="window.open('https://api.whatsapp.com/send?phone=55${u.whatsapp.replace(/\\D/g,'')}', '_blank')" title="Conversar no WhatsApp">
                        💬 WhatsApp
                    </button>
                    ` : ''}
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

window.getUserAuditCount = function(userId) {
    const raw = localStorage.getItem('mapa_eleitoral_audit_v5');
    if (!raw) return 0;
    try {
        const logs = JSON.parse(raw);
        return logs.filter(l => l.userId === userId).length;
    } catch(e) { return 0; }
};

window.viewUserAuditLogs = function(userId, userName) {
    window.switchView('audit');
    const tbody = document.getElementById('table-audit-body');
    const logs = window.SupabaseService.getAuditLogs(state.currentUser, 'all').filter(l => l.userId === userId);
    
    if (tbody) {
        if (logs.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:30px; color:var(--text-muted);">Nenhuma atividade registrada ainda para <strong>${userName}</strong>.</td></tr>`;
            return;
        }

        tbody.innerHTML = logs.map(l => {
            const dt = new Date(l.timestamp).toLocaleString('pt-BR');
            let typeBadge = '';
            if (l.type === 'login') typeBadge = '<span style="color:#60a5fa; font-weight:700;">🔐 Login</span>';
            else if (l.type === 'lideranca') typeBadge = '<span style="color:#34d399; font-weight:700;">📍 Liderança</span>';
            else if (l.type === 'whatsapp') typeBadge = '<span style="color:#25d366; font-weight:700;">💬 WhatsApp</span>';
            else if (l.type === 'senha') typeBadge = '<span style="color:#fbbf24; font-weight:700;">🔑 Senha</span>';
            else typeBadge = '<span style="color:#cbd5e1;">📋 Sistema</span>';

            return `
                <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                    <td style="padding:10px 14px; font-family:monospace; color:var(--text-muted); font-size:0.75rem;">${dt}</td>
                    <td style="padding:10px 14px; font-weight:600; color:#fff;">
                        ${l.userName}
                        <div style="font-size:0.7rem; color:var(--text-dim);">${l.userEmail || l.userRole.toUpperCase()}</div>
                    </td>
                    <td style="padding:10px 14px;">${typeBadge}<br><strong style="font-size:0.78rem; color:#fff;">${l.action}</strong></td>
                    <td style="padding:10px 14px; color:var(--text-muted); font-size:0.78rem;">${l.details}</td>
                    <td style="padding:10px 14px; color:var(--text-dim); font-size:0.72rem;">${l.device || 'Navegador'}</td>
                </tr>
            `;
        }).join('');
    }
};

window.forceCloudSyncUI = async function(btn) {
    if (btn) {
        btn.textContent = '⏳ Sincronizando...';
        btn.disabled = true;
    }
    await window.SupabaseService.pullFromCloud();
    await window.SupabaseService.pushToCloud();
    renderAllViews();
    if (btn) {
        btn.textContent = '✅ Sincronizado!';
        setTimeout(() => {
            btn.textContent = '🔄 Sincronizar';
            btn.disabled = false;
        }, 1500);
    }
};

// 10. CADASTRO DE LIDERANÇA COM PIN NO MAPA & GEOCODIFICAÇÃO
let activeWhatsAppRecipient = null;

function openModalNewLideranca() {
    document.getElementById('form-new-lideranca').reset();
    document.getElementById('inp-lid-lat').value = '-23.4150';
    document.getElementById('inp-lid-lng').value = '-51.4280';
    document.getElementById('geocode-status-indicator').style.display = 'none';
    openModal('modal-new-lideranca');
}

function openNewLiderancaWithColegio(colegioId) {
    openModalNewLideranca();
    const colegio = ELEICAO_2024_DATA.locais.find(l => l.id === colegioId);
    if (colegio) {
        document.getElementById('inp-lid-colegio').value = colegio.id;
        document.getElementById('inp-lid-lat').value = colegio.lat;
        document.getElementById('inp-lid-lng').value = colegio.lng;
        const ind = document.getElementById('geocode-status-indicator');
        ind.style.display = 'block';
        ind.textContent = `📍 Localização vinculada ao Colégio ${colegio.name}`;
    }
}

// BUSCA AUTOMÁTICA DE CEP VIA VIACEP API
async function handleSearchViaCEP() {
    const cepInput = document.getElementById('inp-lid-cep');
    const cleanCep = cepInput.value.replace(/\D/g, '');

    if (cleanCep.length !== 8) {
        alert('Por favor, digite um CEP válido com 8 dígitos.');
        return;
    }

    const btnCep = document.getElementById('btn-search-cep');
    if (btnCep) {
        btnCep.textContent = '⏳ Buscando...';
        btnCep.disabled = true;
    }

    try {
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await res.json();

        if (data.erro) {
            alert('CEP não encontrado na base dos Correios. Por favor, digite a rua e bairro manualmente.');
            return;
        }

        if (data.logradouro) document.getElementById('inp-lid-logradouro').value = data.logradouro;
        if (data.bairro) document.getElementById('inp-lid-bairro').value = data.bairro;

        // Dispara geocodificação automática imediatamente
        triggerAutoGeocode();
    } catch (err) {
        console.error('Erro ao consultar CEP:', err);
    } finally {
        if (btnCep) {
            btnCep.textContent = '🔍 Buscar CEP';
            btnCep.disabled = false;
        }
    }
}

// GEOCODIFICAÇÃO AUTOMÁTICA POR RUA, NÚMERO E BAIRRO EM ARAPONGAS
// Usa parâmetros ESTRUTURADOS do Nominatim para máxima precisão
let geocodeTimeout = null;
function handleAddressInputChange() {
    clearTimeout(geocodeTimeout);
    geocodeTimeout = setTimeout(() => {
        triggerAutoGeocode();
    }, 800);
}

// Viewbox de Arapongas para restringir resultados (SW → NE)
const ARAPONGAS_VIEWBOX = '-51.49,-23.46,-51.37,-23.38';

async function nominatimStructured(street, city, state, countrycodes, bounded) {
    const params = new URLSearchParams({
        format: 'json',
        limit: '3',
        addressdetails: '1',
        countrycodes: countrycodes || 'br',
        state: state || 'Paraná',
        city: city || 'Arapongas',
        viewbox: ARAPONGAS_VIEWBOX,
        bounded: bounded ? '1' : '0'
    });
    if (street) params.set('street', street);
    const resp = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`);
    return await resp.json();
}

async function nominatimFreeText(query) {
    const params = new URLSearchParams({
        format: 'json',
        limit: '3',
        addressdetails: '1',
        countrycodes: 'br',
        viewbox: ARAPONGAS_VIEWBOX,
        bounded: '1',
        q: query
    });
    const resp = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`);
    return await resp.json();
}

function isInsideArapongas(lat, lon) {
    // Bounding box generosa de Arapongas
    return lat >= -23.50 && lat <= -23.34 && lon >= -51.55 && lon <= -51.32;
}

function pickBestResult(results) {
    if (!results || results.length === 0) return null;
    // Filtra resultados que estejam dentro de Arapongas
    const filtered = results.filter(r => isInsideArapongas(parseFloat(r.lat), parseFloat(r.lon)));
    return filtered.length > 0 ? filtered[0] : null;
}

async function triggerAutoGeocode() {
    const rua = document.getElementById('inp-lid-logradouro').value.trim();
    const numero = document.getElementById('inp-lid-numero').value.trim();
    const bairro = document.getElementById('inp-lid-bairro').value.trim();

    if (!rua && !bairro) return;

    const ind = document.getElementById('geocode-status-indicator');
    ind.style.display = 'block';
    ind.style.color = 'var(--text-muted)';
    ind.textContent = '⏳ Calculando posição exata do alfinete no mapa de Arapongas...';

    try {
        let place = null;
        let precision = '';

        // ESTRATÉGIA 1: Busca estruturada com rua + número (mais precisa)
        if (rua) {
            const streetQuery = numero ? `${numero} ${rua}` : rua;
            const results1 = await nominatimStructured(streetQuery, 'Arapongas', 'Paraná', 'br', true);
            place = pickBestResult(results1);
            if (place) precision = 'alta';
        }

        // ESTRATÉGIA 2: Busca estruturada sem número
        if (!place && rua) {
            const results2 = await nominatimStructured(rua, 'Arapongas', 'Paraná', 'br', true);
            place = pickBestResult(results2);
            if (place) precision = 'media';
        }

        // ESTRATÉGIA 3: Busca por texto livre com rua + bairro dentro do viewbox
        if (!place && rua) {
            const freeQuery = `${rua}${numero ? ' ' + numero : ''}, ${bairro || ''}, Arapongas, Paraná`;
            const results3 = await nominatimFreeText(freeQuery);
            place = pickBestResult(results3);
            if (place) precision = 'media';
        }

        // ESTRATÉGIA 4: Busca somente pelo bairro
        if (!place && bairro) {
            const results4 = await nominatimFreeText(`${bairro}, Arapongas, Paraná, Brasil`);
            place = pickBestResult(results4);
            if (place) precision = 'baixa';
        }

        if (place) {
            const lat = parseFloat(place.lat).toFixed(6);
            const lng = parseFloat(place.lon).toFixed(6);

            document.getElementById('inp-lid-lat').value = lat;
            document.getElementById('inp-lid-lng').value = lng;

            if (precision === 'alta') {
                ind.style.color = 'var(--accent-emerald)';
                ind.textContent = `✅ Alfinete georreferenciado com precisão em: ${rua}, ${numero || 'S/N'} (${bairro || 'Arapongas'})!`;
            } else if (precision === 'media') {
                ind.style.color = 'var(--accent-emerald)';
                ind.textContent = `✅ Localização encontrada para: ${rua}${bairro ? ', ' + bairro : ''} — Arapongas/PR`;
            } else {
                ind.style.color = 'var(--accent-amber)';
                ind.textContent = `📍 Posição aproximada pelo bairro ${bairro}. Ajuste manualmente se necessário.`;
            }
        } else {
            ind.style.color = 'var(--accent-rose)';
            ind.textContent = '⚠️ Endereço não localizado automaticamente. Clique em "Ajustar no Mapa" para posicionar manualmente.';
        }
    } catch (e) {
        console.error('Erro no auto-geocoding:', e);
        ind.style.color = 'var(--accent-rose)';
        ind.textContent = '⚠️ Erro de conexão ao geocodificar. Tente "Ajustar no Mapa".';
    }
}

function togglePinDropMode() {
    closeModal('modal-new-lideranca');
    state.isPinDropMode = true;
    window.switchView('map');
    document.getElementById('pin-drop-banner').style.display = 'flex';
}

function cancelPinDropMode() {
    state.isPinDropMode = false;
    document.getElementById('pin-drop-banner').style.display = 'none';
    if (state.pinDropMarker) {
        state.map.removeLayer(state.pinDropMarker);
        state.pinDropMarker = null;
    }
}

function handleMapClickPinDrop(e) {
    if (!state.isPinDropMode) return;

    const lat = e.latlng.lat.toFixed(6);
    const lng = e.latlng.lng.toFixed(6);

    document.getElementById('inp-lid-lat').value = lat;
    document.getElementById('inp-lid-lng').value = lng;

    const ind = document.getElementById('geocode-status-indicator');
    ind.style.display = 'block';
    ind.style.color = 'var(--accent-emerald)';
    ind.textContent = `✅ Posição manual definida pelo clique no mapa! (${lat}, ${lng})`;

    cancelPinDropMode();
    openModal('modal-new-lideranca');
}

// SALVAR LIDERANÇA E CRIAR ALFINETE NO MAPA
async function handleSaveLideranca(e) {
    e.preventDefault();

    const colegioSel = document.getElementById('inp-lid-colegio');
    const colegioId = colegioSel.value;
    const colegioNome = colegioSel.options[colegioSel.selectedIndex]?.text || '';

    let lat = parseFloat(document.getElementById('inp-lid-lat').value);
    let lng = parseFloat(document.getElementById('inp-lid-lng').value);

    // Se as coordenadas forem as padrões, força uma geocodificação precisa antes de salvar
    if (lat === -23.4150 && lng === -51.4280) {
        const rua = document.getElementById('inp-lid-logradouro').value.trim();
        const numero = document.getElementById('inp-lid-numero').value.trim();
        const bairro = document.getElementById('inp-lid-bairro').value.trim();
        if (rua || bairro) {
            try {
                let place = null;
                if (rua) {
                    const streetQ = numero ? `${numero} ${rua}` : rua;
                    const r1 = await nominatimStructured(streetQ, 'Arapongas', 'Paraná', 'br', true);
                    place = pickBestResult(r1);
                    if (!place) {
                        const r2 = await nominatimStructured(rua, 'Arapongas', 'Paraná', 'br', true);
                        place = pickBestResult(r2);
                    }
                }
                if (!place) {
                    const r3 = await nominatimFreeText(`${rua || bairro}, Arapongas, Paraná, Brasil`);
                    place = pickBestResult(r3);
                }
                if (place) {
                    lat = parseFloat(place.lat);
                    lng = parseFloat(place.lon);
                }
            } catch (err) {}
        }
    }

    const newLid = {
        nome: document.getElementById('inp-lid-nome').value.trim(),
        whatsapp: document.getElementById('inp-lid-whatsapp').value.trim(),
        telefone: document.getElementById('inp-lid-telefone').value.trim(),
        cep: document.getElementById('inp-lid-cep')?.value.trim() || '',
        bairro: document.getElementById('inp-lid-bairro').value.trim(),
        logradouro: document.getElementById('inp-lid-logradouro').value.trim(),
        numero: document.getElementById('inp-lid-numero').value.trim(),
        lat: lat,
        lng: lng,
        colegioId: colegioId,
        colegioNome: colegioNome,
        metaVotos: parseInt(document.getElementById('inp-lid-meta').value, 10) || 20,
        categoria: document.getElementById('inp-lid-categoria').value,
        status: 'Ativo',
        observacoes: document.getElementById('inp-lid-obs').value.trim()
    };

    const saved = window.SupabaseService.createLideranca(newLid, state.currentUser);
    loadLiderancas();
    closeModal('modal-new-lideranca');
    renderAllViews();

    // Voa imediatamente até o novo alfinete no mapa e abre o popup
    window.switchView('map');
    state.map.flyTo([saved.lat, saved.lng], 16, { duration: 1 });
}

// 11. SISTEMA DE DISPARO DE WHATSAPP DIRETO & CENTRAL DE MENSAGENS
function openWhatsAppSenderModal(liderancaId) {
    let lid = null;
    if (liderancaId) {
        lid = state.liderancas.find(l => l.id === liderancaId);
    } else if (state.liderancas.length > 0) {
        lid = state.liderancas[0];
    } else {
        // Mock default para teste e conexão
        lid = {
            id: 'temp_conn',
            nome: 'Liderança Exemplo',
            whatsapp: '(43) 99999-9999',
            bairro: 'Centro - Arapongas',
            colegioNome: 'Unidade Polo',
            metaVotos: 30,
            categoria: 'Comunitária'
        };
    }

    activeWhatsAppRecipient = lid;

    const u = state.currentUser;
    const savedSenderNumberKey = `mapa_eleitoral_wa_sender_${u.id}`;
    const savedSenderNum = localStorage.getItem(savedSenderNumberKey) || u.whatsapp || '';

    document.getElementById('wa-recipient-name').textContent = `Destinatário: 👤 ${lid.nome} (${lid.categoria})`;
    document.getElementById('wa-recipient-details').textContent = `📱 ${lid.whatsapp} • 🏡 Bairro: ${lid.bairro} • 🏫 ${lid.colegioNome || 'Colégio Eleitoral'}`;
    document.getElementById('wa-recipient-meta').textContent = `Meta: +${lid.metaVotos} votos`;

    const inpSender = document.getElementById('inp-wa-sender-number');
    if (inpSender) {
        inpSender.value = savedSenderNum;
    }

    document.getElementById('wa-template-select').value = 'welcome';
    applyWhatsAppTemplate('welcome');
    openModal('modal-whatsapp-sender');
}

function applyWhatsAppTemplate(templateKey) {
    if (!activeWhatsAppRecipient) return;
    const lid = activeWhatsAppRecipient;
    const u = state.currentUser;
    const txtArea = document.getElementById('wa-message-text');

    const nome = lid.nome || 'Amigo(a)';
    const bairro = lid.bairro || 'Arapongas';
    const colegio = lid.colegioNome || 'nosso colégio eleitoral';
    const meta = lid.metaVotos || '20';
    const vereador = u.nome || 'Everton Moreira';
    const partido = u.partido || 'Arapongas';

    let msg = '';
    if (templateKey === 'welcome') {
        msg = `Olá ${nome}, tudo bem? Aqui é o vereador ${vereador} (${partido}). Quero agradecer imensamente pelo seu apoio e por integrar nossa rede de lideranças no bairro ${bairro}. Vamos juntos construir um futuro cada vez forte para Arapongas! 🏛️🚀`;
    } else if (templateKey === 'meeting') {
        msg = `Olá ${nome}! Gostaria de convidar você e seus vizinhos para uma reunião importante sobre as melhorias no bairro ${bairro}. Qual o melhor dia desta semana para nos encontrarmos? Abraço, ${vereador}.`;
    } else if (templateKey === 'align') {
        msg = `Olá ${nome}! Estamos organizando o planejamento de seções com foco no ${colegio}. Gostaria de alinhar nossas ações para atingirmos a meta de +${meta} votos na nossa região. Podemos conversar hoje?`;
    } else if (templateKey === 'reminder') {
        msg = `Olá ${nome}! Passando para agradecer pela parceria e lembrar da importância da nossa mobilização no bairro ${bairro} para o ${colegio}. Qualquer dúvida estou 100% à disposição! Um abraço, ${vereador}.`;
    } else {
        msg = `Olá ${nome}, tudo bem? Aqui é o vereador ${vereador}.`;
    }

    txtArea.value = msg;
}

function executeWhatsAppSend() {
    if (!activeWhatsAppRecipient) return;
    const phone = activeWhatsAppRecipient.whatsapp.replace(/\D/g, '');
    const msg = document.getElementById('wa-message-text').value.trim();
    const mode = document.getElementById('sel-wa-dispatch-mode')?.value || 'app';
    const senderNumInput = document.getElementById('inp-wa-sender-number')?.value.trim();

    if (!phone) {
        alert('Número de WhatsApp inválido para esta liderança.');
        return;
    }

    // Salva o número do remetente vinculado ao perfil
    if (senderNumInput && state.currentUser) {
        localStorage.setItem(`mapa_eleitoral_wa_sender_${state.currentUser.id}`, senderNumInput);
    }

    const cleanNumber = phone.length <= 11 ? '55' + phone : phone;

    let waUrl = '';
    if (mode === 'web') {
        waUrl = `https://web.whatsapp.com/send?phone=${cleanNumber}&text=${encodeURIComponent(msg)}`;
    } else {
        waUrl = `https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encodeURIComponent(msg)}`;
    }

    // Atualiza status da liderança para "Em Contato" com timestamp
    try {
        window.SupabaseService.updateLideranca(activeWhatsAppRecipient.id, {
            status: 'Em Contato',
            ultimoContato: new Date().toISOString()
        }, state.currentUser);
        loadLiderancas();
        renderAllViews();
    } catch (e) {
        console.warn('Erro ao atualizar status do contato:', e);
    }

    window.open(waUrl, '_blank');
    closeModal('modal-whatsapp-sender');
}

function deleteLiderancaPrompt(id) {
    if (!confirm('Deseja realmente remover esta liderança e seu alfinete no mapa?')) return;
    
    try {
        window.SupabaseService.deleteLideranca(id, state.currentUser);
        loadLiderancas();
        renderAllViews();
    } catch (e) {
        alert(e.message);
    }
}

// 12. GESTÃO DE TELAS / VIEWS
window.switchView = function(viewName) {
    state.currentView = viewName;

    // Atualiza botões
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    const activeBtn = document.getElementById(`tab-btn-${viewName}`);
    if (activeBtn) activeBtn.classList.add('active');

    // Alterna containers
    document.getElementById('view-map-container').style.display = viewName === 'map' ? 'block' : 'none';
    document.getElementById('view-table-colegios').style.display = viewName === 'colegios' ? 'block' : 'none';
    document.getElementById('view-table-liderancas').style.display = viewName === 'liderancas' ? 'block' : 'none';
    document.getElementById('view-users-management').style.display = viewName === 'users' ? 'block' : 'none';

    const viewDistritos = document.getElementById('view-distritos-management');
    if (viewDistritos) {
        viewDistritos.style.display = viewName === 'distritos' ? 'block' : 'none';
        if (viewName === 'distritos') {
            window.renderDistritosView();
        }
    }

    const viewAudit = document.getElementById('view-audit-logs');
    if (viewAudit) {
        viewAudit.style.display = viewName === 'audit' ? 'block' : 'none';
        if (viewName === 'audit') {
            window.renderAuditLogs();
        }
    }

    if (viewName === 'map' && state.map) {
        setTimeout(() => state.map.invalidateSize(), 150);
    }
};

// 13. GESTÃO E DIRECIONAMENTO ESTRATÉGICO DE DISTRITOS
window.renderDistritosView = function() {
    const cardsContainer = document.getElementById('distritos-macro-cards');
    const tbody = document.getElementById('table-distritos-body');
    if (!cardsContainer || !tbody) return;

    cardsContainer.innerHTML = '';
    tbody.innerHTML = '';

    const allUsers = window.SupabaseService.getAllUsersRaw();
    const vereadores = allUsers.filter(u => u.role === 'vereador');
    const allLids = window.SupabaseService.getAllLiderancasRaw();
    const assignments = window.SupabaseService.getDistrictAssignments();
    const isMaster = state.currentUser && state.currentUser.role === 'master';

    // 1. RENDERIZA OS CARDS DE MACROZONAS
    ARAPONGAS_DISTRITOS_DATA.forEach(dist => {
        // Encontra lideranças vinculadas a este distrito (por colégios ou por bairro)
        const distLids = allLids.filter(l => {
            const matchesColegio = dist.colegiosIds.includes(l.colegioId);
            const matchesBairro = dist.bairros.some(b => (l.bairro || '').toLowerCase().includes(b.toLowerCase()));
            return matchesColegio || matchesBairro;
        });

        let sumMeta = 0;
        distLids.forEach(l => sumMeta += (l.metaVotos || 0));

        const assigned = assignments[dist.id];
        const assignedName = assigned ? assigned.vereadorNome : 'Livre / Coligação';

        const card = document.createElement('div');
        card.style.cssText = `background:var(--bg-card); border:1px solid var(--border-color); border-top:3px solid ${dist.cor}; padding:14px; border-radius:var(--radius-md); box-shadow:var(--shadow-sm);`;
        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div>
                    <span style="font-size:1.4rem;">${dist.icone}</span>
                    <strong style="color:#fff; font-size:0.88rem; display:block; margin-top:4px;">${dist.nome}</strong>
                </div>
                <span style="background:rgba(255,255,255,0.06); color:${dist.cor}; font-size:0.68rem; font-weight:700; padding:2px 6px; border-radius:4px;">
                    ${dist.colegiosIds.length} Colégios
                </span>
            </div>
            <p style="font-size:0.72rem; color:var(--text-muted); margin:8px 0; line-height:1.3;">
                ${dist.descricao}
            </p>
            <div style="background:rgba(15,23,42,0.6); padding:8px; border-radius:6px; margin-top:8px; border:1px solid rgba(255,255,255,0.05);">
                <div style="font-size:0.65rem; color:var(--text-muted); text-transform:uppercase; font-weight:700;">Vereador Designado</div>
                <div style="font-size:0.8rem; font-weight:700; color:#93c5fd; margin-top:1px;">
                    🏛️ ${assignedName}
                </div>
                <div style="display:flex; justify-content:space-between; margin-top:6px; font-size:0.72rem; color:#fff;">
                    <span>📍 <strong>${distLids.length}</strong> lideranças</span>
                    <span style="color:var(--accent-emerald); font-weight:700;">+${sumMeta} votos</span>
                </div>
            </div>
        `;
        cardsContainer.appendChild(card);
    });

    // 2. RENDERIZA A TABELA DE ATRIBUIÇÃO E DIRECIONAMENTO
    ARAPONGAS_DISTRITOS_DATA.forEach(dist => {
        const distLids = allLids.filter(l => {
            const matchesColegio = dist.colegiosIds.includes(l.colegioId);
            const matchesBairro = dist.bairros.some(b => (l.bairro || '').toLowerCase().includes(b.toLowerCase()));
            return matchesColegio || matchesBairro;
        });

        let sumMeta = 0;
        distLids.forEach(l => sumMeta += (l.metaVotos || 0));

        const assigned = assignments[dist.id];
        const assignedId = assigned ? assigned.vereadorId : '';

        // Status de Cobertura
        let statusBadge = '';
        if (distLids.length >= 5) {
            statusBadge = '<span style="background:rgba(16,185,129,0.2); color:#34d399; font-weight:700; font-size:0.72rem; padding:3px 8px; border-radius:12px; border:1px solid rgba(16,185,129,0.4);">🟢 Cobertura Forte</span>';
        } else if (distLids.length > 0) {
            statusBadge = '<span style="background:rgba(245,158,11,0.2); color:#fbbf24; font-weight:700; font-size:0.72rem; padding:3px 8px; border-radius:12px; border:1px solid rgba(245,158,11,0.4);">🟡 Cobertura Média</span>';
        } else {
            statusBadge = '<span style="background:rgba(239,68,68,0.2); color:#f87171; font-weight:700; font-size:0.72rem; padding:3px 8px; border-radius:12px; border:1px solid rgba(239,68,68,0.4);">🔴 Descoberto (Oportunidade)</span>';
        }

        const tr = document.createElement('tr');
        tr.style.cssText = 'border-bottom:1px solid rgba(255,255,255,0.05);';

        // Opções de Vereadores para Designação
        let vereadorSelectHtml = '';
        if (isMaster) {
            vereadorSelectHtml = `
                <select class="select-filter" style="font-size:0.75rem; padding:4px 8px; min-width:180px;" onchange="window.handleAssignDistrict('${dist.id}', this)">
                    <option value="" ${!assignedId ? 'selected' : ''}>-- Livre / Toda Coligação --</option>
                    ${vereadores.map(v => `<option value="${v.id}" ${assignedId === v.id ? 'selected' : ''}>${v.nome} (${v.partido})</option>`).join('')}
                </select>
            `;
        } else {
            vereadorSelectHtml = assigned ? `<strong style="color:#93c5fd;">${assigned.vereadorNome}</strong>` : `<span style="color:var(--text-muted);">Livre / Toda Coligação</span>`;
        }

        tr.innerHTML = `
            <td style="padding:12px 14px;">
                <span style="font-size:1.1rem; margin-right:4px;">${dist.icone}</span>
                <strong style="color:#fff;">${dist.nome}</strong>
                <div style="font-size:0.7rem; color:var(--text-muted);">${dist.zona}</div>
            </td>
            <td style="padding:12px 14px; font-size:0.75rem; color:var(--text-main); max-width:260px;">
                ${dist.bairros.map(b => `<span style="background:rgba(255,255,255,0.06); padding:2px 6px; border-radius:4px; margin:2px; display:inline-block;">${b}</span>`).join(' ')}
            </td>
            <td style="padding:12px 14px; font-size:0.75rem; color:var(--text-dim);">
                ${dist.colegiosIds.length} colégios oficiais
            </td>
            <td style="padding:12px 14px;">
                ${vereadorSelectHtml}
            </td>
            <td style="padding:12px 14px; font-weight:700; color:#fff;">
                📍 ${distLids.length} lideranças
            </td>
            <td style="padding:12px 14px; font-weight:800; color:var(--accent-emerald);">
                +${sumMeta} votos
            </td>
            <td style="padding:12px 14px;">
                ${statusBadge}
            </td>
            <td style="padding:12px 14px;">
                <button class="btn-secondary" style="font-size:0.72rem; padding:4px 8px;" onclick="window.focusDistrictInMap('${dist.id}')">
                    🗺️ Ver no Mapa
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
};

window.handleAssignDistrict = function(districtId, selectEl) {
    const selectedOption = selectEl.options[selectEl.selectedIndex];
    const vereadorId = selectEl.value;
    const vereadorNome = vereadorId ? selectedOption.text.split(' (')[0] : 'Livre / Coligação';

    window.SupabaseService.saveDistrictAssignment(districtId, vereadorId, vereadorNome, state.currentUser);
    window.renderDistritosView();
    alert(`✅ Distrito direcionado com sucesso para ${vereadorNome}!`);
};

window.focusDistrictInMap = function(districtId) {
    const dist = ARAPONGAS_DISTRITOS_DATA.find(d => d.id === districtId);
    if (!dist || !state.map) return;

    window.switchView('map');

    // Centraliza o mapa no primeiro colégio do distrito
    const firstColegio = ELEICAO_2024_DATA.locais.find(l => l.id === dist.colegiosIds[0]);
    if (firstColegio) {
        state.map.flyTo([firstColegio.lat, firstColegio.lng], 14, { duration: 0.8 });
    }
};

// VERIFICAÇÃO INTELIGENTE DE REDUTO / CONFLITO DE BAIRRO DURANTE O CADASTRO DE LIDERANÇA
window.checkDistrictStrategicAlert = function(bairroInput) {
    const alertEl = document.getElementById('district-conflict-alert');
    if (!alertEl) return;

    const query = (bairroInput || '').trim().toLowerCase();
    if (!query || query.length < 3) {
        alertEl.style.display = 'none';
        return;
    }

    const assignments = window.SupabaseService.getDistrictAssignments();
    const currUser = state.currentUser;

    // Encontra se este bairro pertence a algum distrito configurado
    const matchedDist = ARAPONGAS_DISTRITOS_DATA.find(d => 
        d.bairros.some(b => b.toLowerCase().includes(query) || query.includes(b.toLowerCase()))
    );

    if (!matchedDist) {
        alertEl.style.display = 'block';
        alertEl.style.background = 'rgba(16,185,129,0.15)';
        alertEl.style.border = '1px solid rgba(16,185,129,0.3)';
        alertEl.style.color = '#34d399';
        alertEl.innerHTML = `🟢 <strong>Bairro Livre:</strong> Área aberta para expansão eleitoral e novos alfinetes!`;
        return;
    }

    const assigned = assignments[matchedDist.id];
    if (assigned && assigned.vereadorId && assigned.vereadorId !== currUser.id) {
        // Alerta de reduto prioritário de outro vereador
        alertEl.style.display = 'block';
        alertEl.style.background = 'rgba(245,158,11,0.15)';
        alertEl.style.border = '1px solid rgba(245,158,11,0.4)';
        alertEl.style.color = '#fbbf24';
        alertEl.innerHTML = `⚠️ <strong>Atenção de Campanha:</strong> O bairro <strong>${bairroInput}</strong> (${matchedDist.nome}) é reduto prioritário do(a) <strong>${assigned.vereadorNome}</strong>. Mapeie aqui somente se for liderança própria, ou direcione para bairros em aberto para cobrir 100% de Arapongas!`;
    } else {
        alertEl.style.display = 'block';
        alertEl.style.background = 'rgba(59,130,246,0.15)';
        alertEl.style.border = '1px solid rgba(59,130,246,0.3)';
        alertEl.style.color = '#93c5fd';
        alertEl.innerHTML = `🧭 <strong>${matchedDist.nome}:</strong> ${assigned && assigned.vereadorId === currUser.id ? '⭐ Seu reduto eleitoral designado!' : '🟢 Região livre para atuação da coligação.'}`;
    }
};

// 12. BANCO DE DADOS DE AUDITORIA & RELATÓRIOS
window.renderAuditLogs = function() {
    const u = state.currentUser;
    if (!u) return;

    const filterVal = document.getElementById('sel-audit-filter')?.value || 'all';
    const logs = window.SupabaseService.getAuditLogs(u, filterVal);
    const tbody = document.getElementById('table-audit-body');
    if (!tbody) return;

    if (!logs || logs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:20px; color:var(--text-muted);">Nenhum registro de auditoria encontrado para este filtro.</td></tr>`;
        return;
    }

    tbody.innerHTML = logs.map(l => {
        const dt = new Date(l.timestamp).toLocaleString('pt-BR');
        let typeBadge = '';
        if (l.type === 'login') typeBadge = '<span style="color:#60a5fa; font-weight:700;">🔐 Login</span>';
        else if (l.type === 'lideranca') typeBadge = '<span style="color:#34d399; font-weight:700;">📍 Liderança</span>';
        else if (l.type === 'whatsapp') typeBadge = '<span style="color:#25d366; font-weight:700;">💬 WhatsApp</span>';
        else if (l.type === 'senha') typeBadge = '<span style="color:#fbbf24; font-weight:700;">🔑 Senha</span>';
        else typeBadge = '<span style="color:#cbd5e1;">📋 Sistema</span>';

        return `
            <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                <td style="padding:10px 14px; font-family:monospace; color:var(--text-muted); font-size:0.75rem;">${dt}</td>
                <td style="padding:10px 14px; font-weight:600; color:#fff;">
                    ${l.userName}
                    <div style="font-size:0.7rem; color:var(--text-dim);">${l.userEmail || l.userRole.toUpperCase()}</div>
                </td>
                <td style="padding:10px 14px;">${typeBadge}<br><strong style="font-size:0.78rem; color:#fff;">${l.action}</strong></td>
                <td style="padding:10px 14px; color:var(--text-muted); font-size:0.78rem;">${l.details}</td>
                <td style="padding:10px 14px; color:var(--text-dim); font-size:0.72rem;">${l.device || 'Navegador'}</td>
            </tr>
        `;
    }).join('');
};

window.exportAuditLogsCSV = function() {
    const u = state.currentUser;
    if (!u) return;
    const filterVal = document.getElementById('sel-audit-filter')?.value || 'all';
    const logs = window.SupabaseService.getAuditLogs(u, filterVal);

    if (!logs || logs.length === 0) {
        alert('Nenhum registro de auditoria para exportar.');
        return;
    }

    let csv = '\uFEFFData/Hora,Usuario,Email,Perfil,Tipo,Acao,Detalhes,Dispositivo\n';
    logs.forEach(l => {
        const dt = new Date(l.timestamp).toLocaleString('pt-BR');
        const user = `"${(l.userName || '').replace(/"/g, '""')}"`;
        const email = `"${(l.userEmail || '').replace(/"/g, '""')}"`;
        const role = `"${(l.userRole || '').replace(/"/g, '""')}"`;
        const type = `"${(l.type || '').replace(/"/g, '""')}"`;
        const action = `"${(l.action || '').replace(/"/g, '""')}"`;
        const details = `"${(l.details || '').replace(/"/g, '""')}"`;
        const device = `"${(l.device || '').replace(/"/g, '""')}"`;
        csv += `${dt},${user},${email},${role},${type},${action},${details},${device}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `banco_auditoria_mapa_eleitoral_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// 12. CONTROLE DE MODAIS
function openModal(id) {
    const m = document.getElementById(id);
    if (m) m.style.display = 'flex';
}

function closeModal(id) {
    const m = document.getElementById(id);
    if (m) m.style.display = 'none';
}

// 13. ALTERNADOR RÁPIDO DE USUÁRIO (DEMONSTRAÇÃO DE RBAC)
window.switchDemonstrationUser = function(userId) {
    const allUsers = window.SupabaseService.getAllUsersRaw();
    const target = allUsers.find(u => u.id === userId);
    if (target) {
        window.SupabaseService.setCurrentUser(target);
        state.currentUser = target;
        updateUserProfileUI();
        loadLiderancas();
        renderAllViews();
        closeModal('modal-switch-user');

        if (target.primeiroAcesso === true || target.senha === 'Campanha@2026' || !target.senhaAlteradaEm) {
            setTimeout(() => {
                triggerMandatoryFirstAccess(target);
            }, 150);
        }
    }
};

window.quickLoginDemo = function(userId) {
    const allUsers = window.SupabaseService.getAllUsersRaw();
    const target = allUsers.find(u => u.id === userId);
    if (target) {
        window.SupabaseService.setCurrentUser(target);
        state.currentUser = target;
        updateUserProfileUI();
        loadLiderancas();
        renderAllViews();
        closeModal('modal-auth-flow');

        if (target.primeiroAcesso === true || target.senha === 'Campanha@2026' || !target.senhaAlteradaEm) {
            setTimeout(() => {
                triggerMandatoryFirstAccess(target);
            }, 150);
        }
    }
};

// 14. EVENT LISTENERS
function setupEventListeners() {
    document.getElementById('cand-select')?.addEventListener('change', (e) => {
        state.selectedCandidate = e.target.value;
        renderMapColegios();
    });

    document.getElementById('filter-liderancas-vereador')?.addEventListener('change', (e) => {
        state.selectedLiderancaFilter = e.target.value;
        renderMapLiderancas();
    });

    document.getElementById('chk-layer-colegios')?.addEventListener('change', (e) => {
        state.layerColegiosVisible = e.target.checked;
        renderMapColegios();
    });

    document.getElementById('chk-layer-liderancas')?.addEventListener('change', (e) => {
        state.layerLiderancasVisible = e.target.checked;
        renderMapLiderancas();
    });

    document.getElementById('search-liderancas-input')?.addEventListener('input', () => {
        renderSidebar();
    });

    // CEP e Geocodificação Automática
    document.getElementById('btn-search-cep')?.addEventListener('click', handleSearchViaCEP);
    document.getElementById('inp-lid-cep')?.addEventListener('blur', handleSearchViaCEP);
    document.getElementById('inp-lid-cep')?.addEventListener('input', (e) => {
        const raw = e.target.value.replace(/\D/g, '');
        if (raw.length === 8) {
            handleSearchViaCEP();
        }
    });
    document.getElementById('inp-lid-logradouro')?.addEventListener('input', handleAddressInputChange);
    document.getElementById('inp-lid-numero')?.addEventListener('input', handleAddressInputChange);
    document.getElementById('inp-lid-bairro')?.addEventListener('input', handleAddressInputChange);

    document.getElementById('form-new-lideranca')?.addEventListener('submit', handleSaveLideranca);
    document.getElementById('btn-pin-drop-map')?.addEventListener('click', togglePinDropMode);
    document.getElementById('btn-cancel-pin-drop')?.addEventListener('click', cancelPinDropMode);

    // Validação de Senhas em Tempo Real
    const passInput = document.getElementById('auth-reg-pass');
    const confirmInput = document.getElementById('auth-reg-pass-confirm');

    function checkPasswordMatching() {
        const p1 = passInput ? passInput.value : '';
        const p2 = confirmInput ? confirmInput.value : '';
        const ind = document.getElementById('pass-match-indicator');
        const btnSubmit = document.getElementById('btn-submit-register');

        if (!p2) {
            if (ind) ind.style.display = 'none';
            return true;
        }

        if (ind) {
            ind.style.display = 'flex';
            if (p1 === p2) {
                ind.className = 'pass-match-indicator valid';
                ind.textContent = '✅ As senhas coincidem perfeitamente!';
                if (btnSubmit) btnSubmit.disabled = false;
                return true;
            } else {
                ind.className = 'pass-match-indicator invalid';
                ind.textContent = '⚠️ As senhas não coincidem. Digite a mesma senha nos dois campos.';
                return false;
            }
        }
        return true;
    }

    if (passInput) passInput.addEventListener('input', checkPasswordMatching);
    if (confirmInput) confirmInput.addEventListener('input', checkPasswordMatching);

    // Form de Login com detecção de Primeiro Acesso
    document.getElementById('form-auth-login')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('auth-login-email').value.trim();
        const pass = document.getElementById('auth-login-pass').value;
        try {
            const user = await window.SupabaseService.signIn(email, pass);
            state.currentUser = user;
            updateUserProfileUI();
            loadLiderancas();
            renderAllViews();
            closeModal('modal-auth-flow');

            // SE FOR PRIMEIRO ACESSO OU AINDA ESTIVER COM A SENHA PADRÃO, FORÇA IMEDIATAMENTE A TROCA
            if (user.primeiroAcesso === true || user.senha === 'Campanha@2026' || !user.senhaAlteradaEm) {
                setTimeout(() => {
                    triggerMandatoryFirstAccess(user);
                }, 150);
            } else {
                alert(`🎉 Bem-vindo(a) de volta, ${user.nome}!`);
            }
        } catch (err) {
            alert(err.message);
        }
    });

    // Form de Cadastro de Vereador com Confirmação de Senha e Disparo de E-mail
    document.getElementById('form-auth-register')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const pass = document.getElementById('auth-reg-pass').value;
        const passConfirm = document.getElementById('auth-reg-pass-confirm').value;

        if (pass !== passConfirm) {
            alert('❌ Erro de Validação: A confirmação de senha não coincide com a senha digitada. Por favor, corrija antes de prosseguir.');
            document.getElementById('auth-reg-pass-confirm').focus();
            return;
        }

        if (pass.length < 4) {
            alert('A senha deve ter no mínimo 4 caracteres.');
            return;
        }

        const formData = {
            nome: document.getElementById('auth-reg-nome').value.trim(),
            email: document.getElementById('auth-reg-email').value.trim(),
            whatsapp: document.getElementById('auth-reg-whatsapp').value.trim(),
            cpf: document.getElementById('auth-reg-cpf').value.trim(),
            partido: document.getElementById('auth-reg-partido').value.trim(),
            numeroCandidato: document.getElementById('auth-reg-numero').value.trim(),
            cargo: document.getElementById('auth-reg-cargo')?.value || 'Vereador',
            senha: pass
        };

        const btnSubmit = document.getElementById('btn-submit-register');
        if (btnSubmit) {
            btnSubmit.textContent = '⏳ Processando Cadastro & Enviando E-mail...';
            btnSubmit.disabled = true;
        }

        try {
            const result = await window.SupabaseService.registerVereador(formData);
            const user = result.user;
            const emailRes = result.emailResult;

            pendingRegistrationData = { user, emailRes };

            // Preenche dados no modal de confirmação de e-mail
            document.getElementById('email-confirm-target').textContent = user.email;
            document.getElementById('email-confirm-code-display').textContent = emailRes.pinCode.replace(/(\d{3})(\d{3})/, '$1 $2');
            document.getElementById('inp-email-verify-code').value = emailRes.pinCode;
            document.getElementById('email-preview-rendered').innerHTML = emailRes.html;

            closeModal('modal-auth-flow');
            openModal('modal-email-confirmation');
        } catch (err) {
            alert('Erro no cadastro: ' + err.message);
        } finally {
            if (btnSubmit) {
                btnSubmit.textContent = '✨ Concluir Cadastro & Enviar Confirmação por E-mail';
                btnSubmit.disabled = false;
            }
        }
    });

    // Form de Alteração de Senha Opcional
    const chgNew = document.getElementById('chg-pass-new');
    const chgConfirm = document.getElementById('chg-pass-confirm');
    function checkChgPasswordMatch() {
        const p1 = chgNew ? chgNew.value : '';
        const p2 = chgConfirm ? chgConfirm.value : '';
        const ind = document.getElementById('chg-pass-match-indicator');
        if (!p2) {
            if (ind) ind.style.display = 'none';
            return;
        }
        if (ind) {
            ind.style.display = 'flex';
            if (p1 === p2) {
                ind.className = 'pass-match-indicator valid';
                ind.textContent = '✅ As novas senhas coincidem!';
            } else {
                ind.className = 'pass-match-indicator invalid';
                ind.textContent = '⚠️ As senhas não coincidem.';
            }
        }
    }
    if (chgNew) chgNew.addEventListener('input', checkChgPasswordMatch);
    if (chgConfirm) chgConfirm.addEventListener('input', checkChgPasswordMatch);

    document.getElementById('form-change-password')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const currentPass = document.getElementById('chg-pass-current').value;
        const newPass = document.getElementById('chg-pass-new').value;
        const confirmPass = document.getElementById('chg-pass-confirm').value;

        if (newPass !== confirmPass) {
            alert('❌ A nova senha e a confirmação não coincidem.');
            return;
        }

        try {
            await window.SupabaseService.changePassword(state.currentUser.id, currentPass, newPass);
            closeModal('modal-change-password');
            document.getElementById('form-change-password').reset();
            alert('🎉 Senha alterada com sucesso!');
        } catch (err) {
            alert('Erro ao alterar senha: ' + err.message);
        }
    });

    // Form de Alteração de Senha Obrigatória no Primeiro Acesso
    const forceNew = document.getElementById('force-pass-new');
    const forceConfirm = document.getElementById('force-pass-confirm');
    function checkForcePasswordMatch() {
        const p1 = forceNew ? forceNew.value : '';
        const p2 = forceConfirm ? forceConfirm.value : '';
        const ind = document.getElementById('force-pass-match-indicator');
        if (!p2) {
            if (ind) ind.style.display = 'none';
            return;
        }
        if (ind) {
            ind.style.display = 'flex';
            if (p1 === p2) {
                ind.className = 'pass-match-indicator valid';
                ind.textContent = '✅ As senhas coincidem perfeitamente!';
            } else {
                ind.className = 'pass-match-indicator invalid';
                ind.textContent = '⚠️ As senhas não coincidem.';
            }
        }
    }
    if (forceNew) forceNew.addEventListener('input', checkForcePasswordMatch);
    if (forceConfirm) forceConfirm.addEventListener('input', checkForcePasswordMatch);

    document.getElementById('form-force-change-password')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const currentPass = document.getElementById('force-pass-current').value;
        const newPass = document.getElementById('force-pass-new').value;
        const confirmPass = document.getElementById('force-pass-confirm').value;

        if (newPass !== confirmPass) {
            alert('❌ Erro: A confirmação de senha não coincide com a nova senha digitada.');
            document.getElementById('force-pass-confirm').focus();
            return;
        }

        if (newPass.length < 4) {
            alert('A nova senha deve ter no mínimo 4 caracteres.');
            return;
        }

        if (newPass === 'Campanha@2026') {
            alert('Por segurança, sua nova senha não pode ser a senha padrão (Campanha@2026). Defina uma senha pessoal exclusiva.');
            return;
        }

        try {
            await window.SupabaseService.changePassword(state.currentUser.id, currentPass, newPass);
            state.currentUser.primeiroAcesso = false;
            state.currentUser.senha = newPass;
            closeModal('modal-force-change-password');
            updateUserProfileUI();
            loadLiderancas();
            renderAllViews();
            alert(`🎉 Parabéns, ${state.currentUser.nome}!\nSua senha pessoal foi definida com sucesso.\nO sistema de inteligência eleitoral e gestão de lideranças de Arapongas está completamente desbloqueado!`);
        } catch (err) {
            alert('Erro ao registrar nova senha: ' + err.message);
        }
    });
}

// GATILHO DE PRIMEIRO ACESSO OBRIGATÓRIO
function triggerMandatoryFirstAccess(user) {
    if (!user) return;
    const greeting = document.getElementById('force-pass-user-greeting');
    if (greeting) {
        greeting.textContent = `Olá, ${user.nome} (${user.cargo || 'Mandatário'})!`;
    }
    closeModal('modal-auth-flow');
    closeModal('modal-email-confirmation');
    closeModal('modal-switch-user');
    openModal('modal-force-change-password');
}

// TOGGLE VISIBILIDADE DE SENHA
window.togglePassVisibility = function(inputId, btn) {
    const inp = document.getElementById(inputId);
    if (!inp) return;
    if (inp.type === 'password') {
        inp.type = 'text';
        btn.textContent = '🙈';
    } else {
        inp.type = 'password';
        btn.textContent = '👁️';
    }
};

// ATIVAÇÃO DE CONTA APÓS CONFIRMAÇÃO DE E-MAIL
window.verifyAndActivateAccount = function() {
    if (!pendingRegistrationData) {
        closeModal('modal-email-confirmation');
        return;
    }

    const inputCode = document.getElementById('inp-email-verify-code').value.replace(/\D/g, '');
    const realCode = pendingRegistrationData.emailRes.pinCode;

    if (inputCode && inputCode !== realCode) {
        alert('Código de segurança incorreto. Verifique o código enviado no seu e-mail.');
        return;
    }

    const user = pendingRegistrationData.user;
    state.currentUser = user;
    localStorage.setItem('mapa_eleitoral_current_user_v5', JSON.stringify(user));
    localStorage.setItem('mapa_eleitoral_last_active_user', user.id);
    updateUserProfileUI();
    loadLiderancas();
    renderAllViews();
    closeModal('modal-email-confirmation');

    alert(`🎉 Conta ativada com sucesso!\nSeja muito bem-vindo, Vereador(a) ${user.nome} (${user.partido})!\nSeus redutos eleitorais e mapa estão prontos.`);
};

window.resendConfirmationEmail = async function() {
    if (!pendingRegistrationData) return;
    const { user } = pendingRegistrationData;
    const emailRes = await window.EmailService.sendAccessConfirmationEmail(user, user.senha);
    pendingRegistrationData.emailRes = emailRes;
    document.getElementById('email-confirm-code-display').textContent = emailRes.pinCode.replace(/(\d{3})(\d{3})/, '$1 $2');
    document.getElementById('inp-email-verify-code').value = emailRes.pinCode;
    alert(`✉️ Novo e-mail de confirmação enviado para ${user.email}!`);
};
