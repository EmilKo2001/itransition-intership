const args = process.argv.slice(2);

if (args.length === 0) {
    console.log('');
} else {
    const firstString = args[0];

    let longestCommonSubstring = '';

    for (let i = 0; i < firstString.length; i++) {
        for (let j = i + 1; j <= firstString.length; j++) {
            const substring = firstString.slice(i, j);

            if (args.slice(1).every(s => s.includes(substring)) && substring.length > longestCommonSubstring.length) {
                longestCommonSubstring = substring;
            }
        }
    }

    console.log(longestCommonSubstring);
}
