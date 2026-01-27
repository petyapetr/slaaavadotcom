+++json
	{
		title: "Week 0",
		date: "2026-01-27"
	}
+++

Programmers counting from zero — it’s kinda of a meme already. I’m not really into that. However, when it comes to counting weeks, starting from zero makes perfect sense. Hear me out.

At the moment of writing this, we are at the end of January 2026. Any “this week is…” website will tell you that it’s week number five. 

However, that countdown started on week one — December 29 to January 4. 

Why is the first week's Monday in a prior year?

The answer is in the [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) standard. According to it weeks are counted from: 

> the first week with the majority (four or more) of its days in the starting year.

I deem it wrong and misleading. What are we doing here introducing conditionals like that? 

Last Monday of the year shouldn't be in a Week 1 of the next year. If the week starts in a prior year, let it always be W53 of the previous year and optionally W00 of a current year.

First week of the year should start on a first Monday of the year. And weeks should start on Mondays and not on Saturdays. At least here we can agree with standard.

I like conventions like this. That's why I use `YYYY-MM-DD` everywhere I can. Even though it's not human-oriented. It's better than mistaking months with dates, when reading in “freedom” units.

It makes me sad, that universally weeks aren't like that. I don't think it can be changed at this point, but no-one could stop me from counting weeks starting with first Monday of the year.
