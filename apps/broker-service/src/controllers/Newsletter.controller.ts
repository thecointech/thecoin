import { Controller, Get, Put, Route, Query, Body, Post, Response, Tags } from '@tsoa/runtime';
import { signup, unsubscribe, details, update } from '../newsletter'
import { SubscriptionData, Subscription } from '@thecointech/broker-db';
import { BoolResponse } from '../types';
import { ErrorResponse, SubscriptionDetails } from './types';

// Convert from datetime rep to number timestamp
function convert(sub?: Subscription) {
  if (!sub) return { error: "Not Found" };
  const { registerDate, ...rest } = sub;
  return {
    registerDate: registerDate.toMillis(),
    ...rest,
  }
}

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
  async newsletterDetails(@Query() id: string): Promise<SubscriptionDetails|ErrorResponse> {
    const r = await details(id);
    return convert(r);
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
  async newsletterUnsubscribe(@Query() id: string): Promise<BoolResponse> {
    const success = await unsubscribe(id);
    return { success }
  }

  /**
   * Update email subscription.  Also used to confirm
   *
   * details SubscriptionDetails
   * returns BoolResponse
   **/
  @Put("update")
  @Response('200', 'Subscription updated')
  async newsletterUpdate(@Query('id') id: string, @Body() details: SubscriptionData): Promise<SubscriptionDetails|ErrorResponse> {
    const r = await update(id, details);
    return convert(r);
  }

  /**
   * Register an email address for our newsletter.
   *
   * @param email SubscriptionDetails
   * @returns success on true
   **/
  @Post("signup")
  @Response('200', 'Email successfully registered')
  async newsletterSignup(@Query() email: string): Promise<BoolResponse> {
    const success = await signup(email);
    return { success: !!success }
  }
}
