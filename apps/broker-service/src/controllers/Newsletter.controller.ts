import { Controller, Get, Route, Query, Body, Post, Response } from 'tsoa';
import { Signup, Confirm, Unsubscribe, Details } from '../Newsletter'
import { SubscriptionDetails, BoolResponse } from '@the-coin/types';

@Route('newsletter')
export class NewsletterController extends Controller {


    /**
     * Get subscription details.
     *
     * id String 
     * returns SubscriptionDetails
     **/
    @Get('newsletterDetails')
    async newsletterDetails(@Query() id: string) : Promise<SubscriptionDetails> {
        try {
            return await Details(id);
        } catch (e) {
        console.error("Details fetch failed: " + JSON.stringify(e));
        }
        return {
        confirmed: false,
        email: ""
        };
    }

    /**
     * Unsubscribe an email address from our newsletter.
     *
     * id String 
     * returns BoolResponse
     **/
    @Get('newsletterUnsubscribe')
    async newsletterUnsubscribe(@Query() id: string) : Promise<BoolResponse> {
        try {
        const success = await Unsubscribe(id);
        return { success } 
        } catch (e) {
        console.error("Unsubscribe: " + JSON.stringify(e));
        }
        return {success: false};
    }

    @Response('400', 'Bad request')

    /**
     * Confirm email subscription.
     *
     * details SubscriptionDetails 
     * returns BoolResponse
     **/
    @Post("newsletterConfirm")
    async newsletterConfirm(@Body() details: SubscriptionDetails) : Promise<SubscriptionDetails> {
        try {
            return await Confirm(details) || {};
        }
        catch(err) {
        console.error(err);
        throw new Error('Server Error');
        }
    }
    
    /**
     * Register an email address for our newsletter.
     *
     * email SubscriptionDetails  
     * returns BoolResponse
     **/
    @Post("newsletterSignup")
    async newsletterSignup(@Body() details: SubscriptionDetails) : Promise<BoolResponse> {
        try {
        const success = await Signup(details, true);
        return { success } 
        } catch (e) {
        console.error("Signup: " + JSON.stringify(e));
        }
        return {success: false};
    }

}