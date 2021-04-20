/* tslint:disable */
/* eslint-disable */
/**
 * @thecointech/rates-service
 * TheCoin rates service.  Publishes the official exchange rate for TheCore cryptocurrency into fiat currencies
 *
 * The version of the OpenAPI document: 0.2.1
 * Contact: stephen@thecoin.io
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


import { Configuration } from './configuration';
import globalAxios, { AxiosPromise, AxiosInstance } from 'axios';
// Some imports not used depending on template conditions
// @ts-ignore
import { DUMMY_BASE_URL, assertParamExists, setApiKeyToObject, setBasicAuthToObject, setBearerAuthToObject, setOAuthToObject, setSearchParams, serializeDataIfNeeded, toPathString, createRequestFunction } from './common';
// @ts-ignore
import { BASE_PATH, COLLECTION_FORMATS, RequestArgs, BaseAPI, RequiredError } from './base';

/**
 * 
 * @export
 * @enum {string}
 */
export enum CurrencyCode {
    NUMBER_784 = 784,
    NUMBER_971 = 971,
    NUMBER_8 = 8,
    NUMBER_51 = 51,
    NUMBER_532 = 532,
    NUMBER_973 = 973,
    NUMBER_32 = 32,
    NUMBER_36 = 36,
    NUMBER_533 = 533,
    NUMBER_944 = 944,
    NUMBER_977 = 977,
    NUMBER_52 = 52,
    NUMBER_50 = 50,
    NUMBER_975 = 975,
    NUMBER_48 = 48,
    NUMBER_108 = 108,
    NUMBER_60 = 60,
    NUMBER_96 = 96,
    NUMBER_68 = 68,
    NUMBER_984 = 984,
    NUMBER_986 = 986,
    NUMBER_44 = 44,
    NUMBER_64 = 64,
    NUMBER_72 = 72,
    NUMBER_933 = 933,
    NUMBER_84 = 84,
    NUMBER_124 = 124,
    NUMBER_976 = 976,
    NUMBER_947 = 947,
    NUMBER_756 = 756,
    NUMBER_948 = 948,
    NUMBER_990 = 990,
    NUMBER_152 = 152,
    NUMBER_156 = 156,
    NUMBER_170 = 170,
    NUMBER_970 = 970,
    NUMBER_188 = 188,
    NUMBER_931 = 931,
    NUMBER_192 = 192,
    NUMBER_132 = 132,
    NUMBER_203 = 203,
    NUMBER_262 = 262,
    NUMBER_208 = 208,
    NUMBER_214 = 214,
    NUMBER_12 = 12,
    NUMBER_818 = 818,
    NUMBER_232 = 232,
    NUMBER_230 = 230,
    NUMBER_978 = 978,
    NUMBER_242 = 242,
    NUMBER_238 = 238,
    NUMBER_826 = 826,
    NUMBER_981 = 981,
    NUMBER_936 = 936,
    NUMBER_292 = 292,
    NUMBER_270 = 270,
    NUMBER_324 = 324,
    NUMBER_320 = 320,
    NUMBER_328 = 328,
    NUMBER_344 = 344,
    NUMBER_340 = 340,
    NUMBER_191 = 191,
    NUMBER_332 = 332,
    NUMBER_348 = 348,
    NUMBER_360 = 360,
    NUMBER_376 = 376,
    NUMBER_356 = 356,
    NUMBER_368 = 368,
    NUMBER_364 = 364,
    NUMBER_352 = 352,
    NUMBER_388 = 388,
    NUMBER_400 = 400,
    NUMBER_392 = 392,
    NUMBER_404 = 404,
    NUMBER_417 = 417,
    NUMBER_116 = 116,
    NUMBER_174 = 174,
    NUMBER_408 = 408,
    NUMBER_410 = 410,
    NUMBER_414 = 414,
    NUMBER_136 = 136,
    NUMBER_398 = 398,
    NUMBER_418 = 418,
    NUMBER_422 = 422,
    NUMBER_144 = 144,
    NUMBER_430 = 430,
    NUMBER_426 = 426,
    NUMBER_434 = 434,
    NUMBER_504 = 504,
    NUMBER_498 = 498,
    NUMBER_969 = 969,
    NUMBER_807 = 807,
    NUMBER_104 = 104,
    NUMBER_496 = 496,
    NUMBER_446 = 446,
    NUMBER_929 = 929,
    NUMBER_480 = 480,
    NUMBER_462 = 462,
    NUMBER_454 = 454,
    NUMBER_484 = 484,
    NUMBER_979 = 979,
    NUMBER_458 = 458,
    NUMBER_943 = 943,
    NUMBER_516 = 516,
    NUMBER_566 = 566,
    NUMBER_558 = 558,
    NUMBER_578 = 578,
    NUMBER_524 = 524,
    NUMBER_554 = 554,
    NUMBER_512 = 512,
    NUMBER_590 = 590,
    NUMBER_604 = 604,
    NUMBER_598 = 598,
    NUMBER_608 = 608,
    NUMBER_586 = 586,
    NUMBER_985 = 985,
    NUMBER_600 = 600,
    NUMBER_634 = 634,
    NUMBER_946 = 946,
    NUMBER_941 = 941,
    NUMBER_643 = 643,
    NUMBER_646 = 646,
    NUMBER_682 = 682,
    NUMBER_90 = 90,
    NUMBER_690 = 690,
    NUMBER_938 = 938,
    NUMBER_752 = 752,
    NUMBER_702 = 702,
    NUMBER_654 = 654,
    NUMBER_694 = 694,
    NUMBER_706 = 706,
    NUMBER_968 = 968,
    NUMBER_728 = 728,
    NUMBER_930 = 930,
    NUMBER_222 = 222,
    NUMBER_760 = 760,
    NUMBER_748 = 748,
    NUMBER_764 = 764,
    NUMBER_972 = 972,
    NUMBER_934 = 934,
    NUMBER_788 = 788,
    NUMBER_776 = 776,
    NUMBER_949 = 949,
    NUMBER_780 = 780,
    NUMBER_901 = 901,
    NUMBER_834 = 834,
    NUMBER_980 = 980,
    NUMBER_800 = 800,
    NUMBER_840 = 840,
    NUMBER_997 = 997,
    NUMBER_940 = 940,
    NUMBER_858 = 858,
    NUMBER_927 = 927,
    NUMBER_860 = 860,
    NUMBER_928 = 928,
    NUMBER_704 = 704,
    NUMBER_548 = 548,
    NUMBER_882 = 882,
    NUMBER_950 = 950,
    NUMBER_961 = 961,
    NUMBER_959 = 959,
    NUMBER_955 = 955,
    NUMBER_956 = 956,
    NUMBER_957 = 957,
    NUMBER_958 = 958,
    NUMBER_951 = 951,
    NUMBER_960 = 960,
    NUMBER_952 = 952,
    NUMBER_964 = 964,
    NUMBER_953 = 953,
    NUMBER_962 = 962,
    NUMBER_994 = 994,
    NUMBER_963 = 963,
    NUMBER_965 = 965,
    NUMBER_999 = 999,
    NUMBER_886 = 886,
    NUMBER_710 = 710,
    NUMBER_967 = 967,
    NUMBER_932 = 932
}

/**
 * 
 * @export
 * @interface FXRate
 */
export interface FXRate {
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _8?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _12?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _32?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _36?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _44?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _48?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _50?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _51?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _52?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _60?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _64?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _68?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _72?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _84?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _90?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _96?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _104?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _108?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _116?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _124?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _132?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _136?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _144?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _152?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _156?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _170?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _174?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _188?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _191?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _192?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _203?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _208?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _214?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _222?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _230?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _232?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _238?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _242?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _262?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _270?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _292?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _320?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _324?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _328?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _332?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _340?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _344?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _348?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _352?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _356?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _360?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _364?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _368?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _376?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _388?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _392?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _398?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _400?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _404?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _408?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _410?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _414?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _417?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _418?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _422?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _426?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _430?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _434?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _446?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _454?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _458?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _462?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _480?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _484?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _496?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _498?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _504?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _512?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _516?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _524?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _532?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _533?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _548?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _554?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _558?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _566?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _578?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _586?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _590?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _598?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _600?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _604?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _608?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _634?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _643?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _646?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _654?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _682?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _690?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _694?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _702?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _704?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _706?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _710?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _728?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _748?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _752?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _756?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _760?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _764?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _776?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _780?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _784?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _788?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _800?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _807?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _818?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _826?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _834?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _840?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _858?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _860?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _882?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _886?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _901?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _927?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _928?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _929?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _930?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _931?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _932?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _933?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _934?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _936?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _938?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _940?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _941?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _943?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _944?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _946?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _947?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _948?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _949?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _950?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _951?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _952?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _953?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _955?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _956?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _957?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _958?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _959?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _960?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _961?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _962?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _963?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _964?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _965?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _967?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _968?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _969?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _970?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _971?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _972?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _973?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _975?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _976?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _977?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _978?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _979?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _980?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _981?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _984?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _985?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _986?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _990?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _994?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _997?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    _999?: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    validTill: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    validFrom: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    sell: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    buy: number;
    /**
     * 
     * @type {number}
     * @memberof FXRate
     */
    fxRate: number;
    /**
     * 
     * @type {CurrencyCode}
     * @memberof FXRate
     */
    target: CurrencyCode;
}

/**
 * DefaultApi - axios parameter creator
 * @export
 */
export const DefaultApiAxiosParamCreator = function (configuration?: Configuration) {
    return {
        /**
         * Get rates.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        doUpdate: async (options: any = {}): Promise<RequestArgs> => {
            const localVarPath = `/doUpdate`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;


    
            setSearchParams(localVarUrlObj, localVarQueryParameter, options.query);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
    }
};

/**
 * DefaultApi - functional programming interface
 * @export
 */
export const DefaultApiFp = function(configuration?: Configuration) {
    const localVarAxiosParamCreator = DefaultApiAxiosParamCreator(configuration)
    return {
        /**
         * Get rates.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async doUpdate(options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<boolean>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.doUpdate(options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
    }
};

/**
 * DefaultApi - factory interface
 * @export
 */
export const DefaultApiFactory = function (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) {
    const localVarFp = DefaultApiFp(configuration)
    return {
        /**
         * Get rates.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        doUpdate(options?: any): AxiosPromise<boolean> {
            return localVarFp.doUpdate(options).then((request) => request(axios, basePath));
        },
    };
};

/**
 * DefaultApi - object-oriented interface
 * @export
 * @class DefaultApi
 * @extends {BaseAPI}
 */
export class DefaultApi extends BaseAPI {
    /**
     * Get rates.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof DefaultApi
     */
    public doUpdate(options?: any) {
        return DefaultApiFp(this.configuration).doUpdate(options).then((request) => request(this.axios, this.basePath));
    }
}


/**
 * RatesApi - axios parameter creator
 * @export
 */
export const RatesApiAxiosParamCreator = function (configuration?: Configuration) {
    return {
        /**
         * Query many values simultaneously
         * @param {Array<number>} timestamps 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getMany: async (timestamps: Array<number>, options: any = {}): Promise<RequestArgs> => {
            // verify required parameter 'timestamps' is not null or undefined
            assertParamExists('getMany', 'timestamps', timestamps)
            const localVarPath = `/many`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            if (timestamps) {
                localVarQueryParameter['timestamps'] = timestamps;
            }


    
            setSearchParams(localVarUrlObj, localVarQueryParameter, options.query);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * Query a single value
         * @param {number} currencyCode 
         * @param {number} [timestamp] 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getSingle: async (currencyCode: number, timestamp?: number, options: any = {}): Promise<RequestArgs> => {
            // verify required parameter 'currencyCode' is not null or undefined
            assertParamExists('getSingle', 'currencyCode', currencyCode)
            const localVarPath = `/rates/{currencyCode}`
                .replace(`{${"currencyCode"}}`, encodeURIComponent(String(currencyCode)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            if (timestamp !== undefined) {
                localVarQueryParameter['timestamp'] = timestamp;
            }


    
            setSearchParams(localVarUrlObj, localVarQueryParameter, options.query);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
    }
};

/**
 * RatesApi - functional programming interface
 * @export
 */
export const RatesApiFp = function(configuration?: Configuration) {
    const localVarAxiosParamCreator = RatesApiAxiosParamCreator(configuration)
    return {
        /**
         * Query many values simultaneously
         * @param {Array<number>} timestamps 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async getMany(timestamps: Array<number>, options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<Array<FXRate>>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.getMany(timestamps, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
        /**
         * Query a single value
         * @param {number} currencyCode 
         * @param {number} [timestamp] 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async getSingle(currencyCode: number, timestamp?: number, options?: any): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<FXRate>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.getSingle(currencyCode, timestamp, options);
            return createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration);
        },
    }
};

/**
 * RatesApi - factory interface
 * @export
 */
export const RatesApiFactory = function (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) {
    const localVarFp = RatesApiFp(configuration)
    return {
        /**
         * Query many values simultaneously
         * @param {Array<number>} timestamps 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getMany(timestamps: Array<number>, options?: any): AxiosPromise<Array<FXRate>> {
            return localVarFp.getMany(timestamps, options).then((request) => request(axios, basePath));
        },
        /**
         * Query a single value
         * @param {number} currencyCode 
         * @param {number} [timestamp] 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getSingle(currencyCode: number, timestamp?: number, options?: any): AxiosPromise<FXRate> {
            return localVarFp.getSingle(currencyCode, timestamp, options).then((request) => request(axios, basePath));
        },
    };
};

/**
 * RatesApi - object-oriented interface
 * @export
 * @class RatesApi
 * @extends {BaseAPI}
 */
export class RatesApi extends BaseAPI {
    /**
     * Query many values simultaneously
     * @param {Array<number>} timestamps 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof RatesApi
     */
    public getMany(timestamps: Array<number>, options?: any) {
        return RatesApiFp(this.configuration).getMany(timestamps, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * Query a single value
     * @param {number} currencyCode 
     * @param {number} [timestamp] 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof RatesApi
     */
    public getSingle(currencyCode: number, timestamp?: number, options?: any) {
        return RatesApiFp(this.configuration).getSingle(currencyCode, timestamp, options).then((request) => request(this.axios, this.basePath));
    }
}


