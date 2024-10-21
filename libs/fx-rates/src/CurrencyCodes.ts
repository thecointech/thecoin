export enum CurrencyCode {
  // Do not include THE as currency code here.
  // It confuses our type declarations in rates-service,
  // and has no legitimate reason to be present
	//THE = 0,   // THE Currency

	AED = 784, //United Arab Emirates dirham
	AFN = 971, //Afghan afghani
	ALL = 8,  //Albanian lek
	AMD = 51,  //Armenian dram
	ANG = 532, //Netherlands Antillean guilder
	AOA = 973, //Angolan kwanza
	ARS = 32,  //Argentine peso
	AUD = 36,  //Australian dollar
	AWG = 533, //Aruban florin
	AZN = 944, //Azerbaijani manat
	BAM = 977, //Bosnia and Herzegovina convertible mark
	BBD = 52,  //Barbados dollar
	BDT = 50,  //Bangladeshi taka
	BGN = 975, //Bulgarian lev
	BHD = 48,  //Bahraini dinar
	BIF = 108, //Burundian franc
	BMD = 60,  //Bermudian dollar
	BND = 96,  //Brunei dollar
	BOB = 68,  //Boliviano
	BOV = 984, //Bolivian Mvdol (funds code)
	BRL = 986, //Brazilian real
	BSD = 44,  //Bahamian dollar
	BTN = 64,  //Bhutanese ngultrum
	BWP = 72,  //Botswana pula
	BYN = 933, //Belarusian ruble
	BZD = 84,  //Belize dollar
	CAD = 124, //Canadian dollar
	CDF = 976, //Congolese franc
	CHE = 947, //WIR Euro (complementary currency)
	CHF = 756, //Swiss franc
	CHW = 948, //WIR Franc (complementary currency)
	CLF = 990, //Unidad de Fomento (funds code)
	CLP = 152, //Chilean peso
	CNY = 156, //Renminbi (Chinese) yuan[8]
	COP = 170, //Colombian peso
	COU = 970, //9]
	CRC = 188, //Costa Rican colon
	CUC = 931, //Cuban convertible peso
	CUP = 192, //Cuban peso
	CVE = 132, //Cape Verde escudo
	CZK = 203, //Czech koruna
	DJF = 262, //Djiboutian franc
	DKK = 208, //Danish krone
	DOP = 214, //Dominican peso
	DZD = 12,  //Algerian dinar
	EGP = 818, //Egyptian pound
	ERN = 232, //Eritrean nakfa
	ETB = 230, //Ethiopian birr
	EUR = 978, //Euro
	FJD = 242, //Fiji dollar
	FKP = 238, //Falkland Islands pound
	GBP = 826, //Pound sterling
	GEL = 981, //Georgian lari
	GHS = 936, //Ghanaian cedi
	GIP = 292, //Gibraltar pound
	GMD = 270, //Gambian dalasi
	GNF = 324, //Guinean franc
	GTQ = 320, //Guatemalan quetzal
	GYD = 328, //Guyanese dollar
	HKD = 344, //Hong Kong dollar
	HNL = 340, //Honduran lempira
	HRK = 191, //Croatian kuna
	HTG = 332, //Haitian gourde
	HUF = 348, //Hungarian forint
	IDR = 360, //Indonesian rupiah
	ILS = 376, //Israeli new shekel
	INR = 356, //Indian rupee
	IQD = 368, //Iraqi dinar
	IRR = 364, //Iranian rial
	ISK = 352, //Icelandic króna
	JMD = 388, //Jamaican dollar
	JOD = 400, //Jordanian dinar
	JPY = 392, //Japanese yen
	KES = 404, //Kenyan shilling
	KGS = 417, //Kyrgyzstani som
	KHR = 116, //Cambodian riel
	KMF = 174, //Comoro franc
	KPW = 408, //North Korean won
	KRW = 410, //South Korean won
	KWD = 414, //Kuwaiti dinar
	KYD = 136, //Cayman Islands dollar
	KZT = 398, //Kazakhstani tenge
	LAK = 418, //Lao kip
	LBP = 422, //Lebanese pound
	LKR = 144, //Sri Lankan rupee
	LRD = 430, //Liberian dollar
	LSL = 426, //Lesotho loti
	LYD = 434, //Libyan dinar
	MAD = 504, //Moroccan dirham
	MDL = 498, //Moldovan leu
	MGA = 969, //Malagasy ariary
	MKD = 807, //Macedonian denar
	MMK = 104, //Myanmar kyat
	MNT = 496, //Mongolian tögrög
	MOP = 446, //Macanese pataca
	MRU = 929, //Mauritanian ouguiya
	MUR = 480, //Mauritian rupee
	MVR = 462, //Maldivian rufiyaa
	MWK = 454, //Malawian kwacha
	MXN = 484, //Mexican peso
	MXV = 979, //Mexican Unidad de Inversion (UDI) (funds code)
	MYR = 458, //Malaysian ringgit
	MZN = 943, //Mozambican metical
	NAD = 516, //Namibian dollar
	NGN = 566, //Nigerian naira
	NIO = 558, //Nicaraguan córdoba
	NOK = 578, //Norwegian krone
	NPR = 524, //Nepalese rupee
	NZD = 554, //New Zealand dollar
	OMR = 512, //Omani rial
	PAB = 590, //Panamanian balboa
	PEN = 604, //Peruvian sol
	PGK = 598, //Papua New Guinean kina
	PHP = 608, //Philippine peso
	PKR = 586, //Pakistani rupee
	PLN = 985, //Polish złoty
	PYG = 600, //Paraguayan guaraní
	QAR = 634, //Qatari riyal
	RON = 946, //Romanian leu
	RSD = 941, //Serbian dinar
	RUB = 643, //Russian ruble
	RWF = 646, //Rwandan franc
	SAR = 682, //Saudi riyal
	SBD = 90,  //Solomon Islands dollar
	SCR = 690, //Seychelles rupee
	SDG = 938, //Sudanese pound
	SEK = 752, //Swedish krona/kronor
	SGD = 702, //Singapore dollar
	SHP = 654, //Saint Helena pound
	SLL = 694, //Sierra Leonean leone
	SOS = 706, //Somali shilling
	SRD = 968, //Surinamese dollar
	SSP = 728, //South Sudanese pound
	STN = 930, //São Tomé and Príncipe dobra
	SVC = 222, //Salvadoran colón
	SYP = 760, //Syrian pound
	SZL = 748, //Swazi lilangeni
	THB = 764, //Thai baht
	TJS = 972, //Tajikistani somoni
	TMT = 934, //Turkmenistan manat
	TND = 788, //Tunisian dinar
	TOP = 776, //Tongan paʻanga
	TRY = 949, //Turkish lira
	TTD = 780, //Trinidad and Tobago dollar
	TWD = 901, //New Taiwan dollar
	TZS = 834, //Tanzanian shilling
	UAH = 980, //Ukrainian hryvnia
	UGX = 800, //Ugandan shilling
	USD = 840, //United States dollar
	USN = 997, //United States dollar (next day) (funds code)
	UYI = 940, //Uruguay Peso en Unidades Indexadas (URUIURUI) (funds code)
	UYU = 858, //Uruguayan peso
	UYW = 927, //Unidad previsional[16]
	UZS = 860, //Uzbekistan som
	VES = 928, //Venezuelan bolívar soberano[14]
	VND = 704, //Vietnamese đồng
	VUV = 548, //Vanuatu vatu
	WST = 882, //Samoan tala
	XAF = 950, //CFA franc BEAC
	XAG = 961, //Silver (one troy ounce)
	XAU = 959, //Gold (one troy ounce)
	XBA = 955, //European Composite Unit (EURCO) (bond market unit)
	XBB = 956, //European Monetary Unit (E.M.U.-6) (bond market unit)
	XBC = 957, //European Unit of Account 9 (E.U.A.-9) (bond market unit)
	XBD = 958, //European Unit of Account 17 (E.U.A.-17) (bond market unit)
	XCD = 951, //East Caribbean dollar
	XDR = 960, //Special drawing rights
	XOF = 952, //CFA franc BCEAO
	XPD = 964, //Palladium (one troy ounce)
	XPF = 953, //CFP franc (franc Pacifique)
	XPT = 962, //Platinum (one troy ounce)
	XSU = 994, //SUCRE
	XTS = 963, //Code reserved for testing purposes
	XUA = 965, //ADB Unit of Account
	XXX = 999, //No currency
	YER = 886, //Yemeni rial
	ZAR = 710, //South African rand
	ZMW = 967, //Zambian kwacha
	ZWL = 932, //Zimbabwean dollar
}

export type CurrencyKey = keyof typeof CurrencyCode;
