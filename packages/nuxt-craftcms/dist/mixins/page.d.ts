import { Vue } from 'nuxt-property-decorator';
export default class PageMixin extends Vue {
    page: any;
    pageType: string;
    appBaseUrl: string;
    productionUrl: string;
    siteName: string;
    head(): {
        title: any;
        meta: (boolean | {
            hid: string;
            name: string;
            content: any;
        })[];
        link: {
            rel: string;
            href: any;
        }[];
    };
    asyncData(context: any): Promise<{
        page: any;
        pageType: any;
        errorType: any;
        showEditBtn: any;
        editUrl: any;
    }>;
}
