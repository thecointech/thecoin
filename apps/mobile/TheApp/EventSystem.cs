using System;
using Prism.Events;

namespace TheApp
{
	/// <summary>
	/// Static EventAggregator
	/// </summary>
	public static class EventSystem
	{
		private static IEventAggregator _current;
		public static IEventAggregator Current
		{
			get
			{
				return _current ?? (_current = new EventAggregator());
			}
		}

		private static PubSubEvent<TEvent> GetEvent<TEvent>() where TEvent : EventBase, new()
		{
			return Current.GetEvent<PubSubEvent<TEvent>>();
		}

		public static void Publish<TEvent>() where TEvent : EventBase, new()
		{
			Publish<TEvent>(default(TEvent));
		}

		public static void Publish<TEvent>(TEvent @event) where TEvent : EventBase, new()
		{
			GetEvent<TEvent>().Publish(@event);
		}

		public static SubscriptionToken Subscribe<TEvent>(Action action, ThreadOption threadOption = ThreadOption.PublisherThread, bool keepSubscriberReferenceAlive = false) where TEvent : EventBase, new()
		{
			return Subscribe<TEvent>(e => action(), threadOption, keepSubscriberReferenceAlive);
		}

		public static SubscriptionToken Subscribe<TEvent>(Action<TEvent> action, ThreadOption threadOption = ThreadOption.PublisherThread, bool keepSubscriberReferenceAlive = false, Predicate<TEvent> filter = null) where TEvent : EventBase, new()
		{
			return GetEvent<TEvent>().Subscribe(action, threadOption, keepSubscriberReferenceAlive, filter);
		}

		public static void Unsubscribe<TEvent>(SubscriptionToken token) where TEvent : EventBase, new()
		{
			GetEvent<TEvent>().Unsubscribe(token);
		}
		public static void Unsubscribe<TEvent>(Action<TEvent> subscriber) where TEvent : EventBase, new()
		{
			GetEvent<TEvent>().Unsubscribe(subscriber);
		}
	}
}
