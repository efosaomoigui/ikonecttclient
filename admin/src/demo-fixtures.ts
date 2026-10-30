import { fixtures, uuid } from './fixtures';

/** Fictional, resettable examples for the standalone artifact only. No imported customer data. */
export function standaloneFixtures(): ReturnType<typeof fixtures> {
    const data=fixtures();
    const home=data.plans.find(p=>p.id===uuid(10))!;
    const business=data.plans.find(p=>p.id===uuid(11))!;
    Object.assign(home,{name:'Demo Home 80',speedMbps:80,published:true,priceMinor:1950000,renewalPriceMinor:1950000,updatedAt:'2026-10-22T00:00:00.000Z',features:['Fictional demonstration plan','Illustrative NGN19,500 catalogue/renewal price; not approved commercial pricing']});
    Object.assign(business,{name:'Demo Business 250',published:true,features:['Fictional business demonstration plan','Illustrative commercial terms only']});

    // A: previously renewed, now expired, with an independently funded NGN30,000 wallet.
    const a=data.walletSummaries.find(s=>s.customerId===uuid(1))!;
    Object.assign(a,{postedMinor:3000000,reservedMinor:0,availableMinor:3000000,pendingTopUpsMinor:0,pendingTopUpsCount:0});
    Object.assign(data.customers.find(c=>c.id===uuid(1))!,{createdAt:'2026-08-01T08:00:00.000Z'});
    Object.assign(data.walletTopUps[0],{amountMinor:4950000,reference:'SIMULATED-DEMO-A-OPENING',createdAt:'2026-08-21T08:00:00.000Z',verifiedAt:'2026-08-21T08:00:00.000Z'});
    const opening=data.walletEntries.find(e=>e.id===uuid(230))!;
    Object.assign(opening,{amountMinor:4950000,postedDeltaMinor:4950000,postedAfterMinor:4950000,reference:'SIMULATED-DEMO-A-OPENING',createdAt:'2026-08-21T08:00:00.000Z'});
    Object.assign(data.walletEntries.find(e=>e.id===uuid(231))!,{postedAfterMinor:4950000,createdAt:'2026-08-22T08:00:00.000Z'});
    Object.assign(data.walletEntries.find(e=>e.id===uuid(232))!,{postedAfterMinor:3000000,createdAt:'2026-08-22T08:00:00.000Z'});
    Object.assign(data.walletRenewals[0],{planName:home.name,previousEndsAt:'2026-08-22T08:00:00.000Z',expectedEndsAt:'2026-09-21T08:00:00.000Z',confirmedEndsAt:'2026-09-21T08:00:00.000Z',createdAt:'2026-08-22T08:00:00.000Z',updatedAt:'2026-08-22T08:00:00.000Z'});
    Object.assign(data.walletFixtureSubscriptions[0],{status:'SUSPENDED',startsAt:'2026-08-22T08:00:00.000Z',endsAt:'2026-09-21T08:00:00.000Z'});
    Object.assign(data.subscriptions.find(s=>s.id===uuid(260))!,data.walletFixtureSubscriptions[0]);

    // Move the independent uncertain-outcome example away from customer B.
    const review=data.walletRenewals[1];
    Object.assign(review,{customerId:uuid(3),subscriptionId:uuid(262),planName:home.name});
    Object.assign(data.walletEntries.find(e=>e.id===uuid(233))!,{customerId:uuid(3),walletId:uuid(242)});
    Object.assign(data.walletEntries.find(e=>e.id===uuid(234))!,{customerId:uuid(3),walletId:uuid(242)});
    Object.assign(data.walletSummaries.find(s=>s.customerId===uuid(3))!,{postedMinor:1950000,reservedMinor:1950000,availableMinor:0});
    const reviewSub={...data.walletFixtureSubscriptions[1],id:uuid(262),customerId:uuid(3),planId:home.id};
    data.subscriptions.push(reviewSub);
    Object.assign(data.orders.find(o=>o.id===review.orderId)!,{customerId:uuid(3),subscriptionId:reviewSub.id,planName:home.name});

    // B: active business service, zero available/held credit. Pending reports are not funds.
    Object.assign(data.walletSummaries.find(s=>s.customerId===uuid(2))!,{postedMinor:0,reservedMinor:0,availableMinor:0});
    const b=data.subscriptions.find(s=>s.id===uuid(261))!;
    Object.assign(b,{customerId:uuid(2),planId:business.id,status:'ACTIVE',startsAt:'2026-10-01T08:00:00.000Z',endsAt:'2026-12-31T08:00:00.000Z',renewalEnabled:true});
    data.subscriptions=data.subscriptions.filter(s=>s.id!==uuid(60));
    for(const order of data.orders){
        if(order.customerId===uuid(2))Object.assign(order,{planId:business.id,planName:business.name,amountMinor:business.priceMinor});
        else if(order.planId===home.id)order.planName=home.name;
    }
    for(const payment of data.payments){
        const order=data.orders.find(o=>o.id===payment.orderId);
        if(order?.customerId===uuid(2))payment.amountMinor=order.amountMinor;
    }
    // All previous-period history is illustrative; no real service outcome is represented.
    for(const summary of data.walletSummaries)summary.topUpInstructions.notice='Standalone fictional wallet. No transfer, bank settlement or live provider is connected.';
    return data;
}
