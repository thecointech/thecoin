import { log } from '@thecointech/logging';
import { Controller, Get, Put, Route, Query, Body, Post, Response, Tags } from '@tsoa/runtime';
import { Signup, Unsubscribe, Details, SubscriptionDetails, Update } from '../newsletter'
import { BoolResponse } from '../types';

@Route('newsletter')
@Tags('Newsletter')
export class NewsletterController extends Controller {

    /**
     * Get subscription details.
     *
     * id String
     * returns SubscriptionDetails
     **/
    @Get('details')
    @Response('200', 'Subscription details')
    @Response('400', 'Not Found')
    @Response('500', 'Server Error')
    async newsletterDetails(@Query() id: string) : Promise<SubscriptionDetails> {
      let details: SubscriptionDetails = {
        confirmed: false,
        email: ""
      };
      try {
        details = await Details(id) ?? details;
      } catch (e) {
        log.error(e, "Details fetch failed");
      }
      return details
    }

    /**
     * Unsubscribe an email address from our newsletter.
     *
     * id String
     * returns BoolResponse
     **/
    @Get('unsubscribe')
    @Response('200', 'Email successfully removed')
    @Response('500', 'Server Error')
    async newsletterUnsubscribe(@Query() id: string) : Promise<BoolResponse> {
        try {
            const success = await Unsubscribe(id);
            return { success }
        } catch (e) {
            log.error(e, "Unsubscribe");
        }
        return {success: false};
    }

    /**
     * Update email subscription.  Also used to confirm
     *
     * details SubscriptionDetails
     * returns BoolResponse
     **/
    @Put("update")
    @Response('200', 'Subscription updated')
    @Response('403', 'Not Permitted')
    @Response('500', 'Server Error')
    async newsletterUpdate(@Query('id') id: string, @Body() details: SubscriptionDetails) : Promise<SubscriptionDetails> {
        try {
          const r = await Update(id, details);
          if (!r) {
            this.setStatus(403)
          }
          else return r;
        }
        catch(err) {
            log.error(err, "Newsletter confirm failed");
        }
        return {} as SubscriptionDetails;
    }

    /**
     * Register an email address for our newsletter.
     *
     * @param email SubscriptionDetails
     * @returns success on true, else false
     **/
    @Post("signup")
    @Response('200', 'Email successfully registered')
    async newsletterSignup(@Query() email: string) : Promise<BoolResponse> {
        try {
            const success = !!(await Signup(email));
            return { success }
        } catch (e) {
            log.error(e, "Signup");
        }
        return {success: false};
    }

}
