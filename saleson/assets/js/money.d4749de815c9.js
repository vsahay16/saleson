/* Shared decimal-to-paise normalization and Indian currency words. */
window.SalesOnMoney = (() => {
  const small=['Zero','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
  const tens=['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
  function minorUnits(value) {
    const text=String(value).trim().replaceAll(',','');
    const match=text.match(/^([+-]?)(\d+)(?:\.(\d*))?(?:e([+-]?\d+))?$/i);
    if (!match) throw new RangeError('Invalid amount');
    const exponent=Number(match[4] || 0), fraction=match[3] || '';
    if (Math.abs(exponent)>20) throw new RangeError('Amount outside supported range');
    const coefficient=BigInt(match[2]+fraction);
    const shift=exponent-fraction.length+2;
    let cents;
    if(shift>=0)cents=coefficient*10n**BigInt(shift);
    else {const divisor=10n**BigInt(-shift);cents=(coefficient+divisor/2n)/divisor;}
    if(cents>BigInt(Number.MAX_SAFE_INTEGER))throw new RangeError('Amount outside supported range');
    return Number(cents)*(match[1]==='-'?-1:1);
  }
  function words(n) {
    if(n<20)return small[n];
    if(n<100)return tens[Math.floor(n/10)]+(n%10?' '+small[n%10]:'');
    for(const [scale,label] of [[10000000,'Crore'],[100000,'Lakh'],[1000,'Thousand'],[100,'Hundred']]){
      if(n>=scale)return words(Math.floor(n/scale))+' '+label+(n%scale?' '+words(n%scale):'');
    }
  }
  function toWords(value) {
    try {
      const cents=minorUnits(value), magnitude=Math.abs(cents);
      const whole=Math.floor(magnitude/100), paise=magnitude%100;
      return (cents<0?'Minus ':'')+words(whole)+(whole===1?' Rupee':' Rupees')+(paise?' and '+words(paise)+(paise===1?' Paisa':' Paise'):'')+' Only';
    } catch (_) { return 'Amount unavailable'; }
  }
  return Object.freeze({minorUnits,toWords});
})();
