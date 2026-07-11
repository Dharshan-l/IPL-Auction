import { Player, PlayerRole, PlayerCountryType, PlayerPlayingStatus } from '../types';

// We split the player dataset into multiple parts to stay well within token limits during file creation.
const CSV_PART1 = `Name,Team,Role,Country,BasePrice,Image,Runs,Average,StrikeRate,Wickets,Economy,Matches,LatestSeason,TeamCode
AB de Villiers,,WK-Batter,South Africa,,https://commons.wikimedia.org/w/index.php?search=AB+de+Villiers&title=Special:MediaSearch&type=image,,,,,,,2022.0,
Abdul Samad,LSG,AR,India,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/525.png",741.0,19.5,142.8,2.0,10.5,63.0,2026.0,
Abhinandan Singh,RCB,AR,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/3574.png",5.0,5.0,100.0,0.0,0.0,1.0,,
Abhishek Porel,DC,WK,India,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/1580.png",80.0,16.0,118.0,0.0,0.0,8.0,2026.0,
Abhishek Sharma,SRH,AR,India,₹1.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/212.png",1816.0,27.1,157.4,11.0,8.9,77.0,2026.0,
Adam Milne,RR,BOWL,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/189.png",12.0,6.0,120.0,10.0,8.5,12.0,,
Aiden Markram,LSG,BAT,South Africa,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/287.png",582.0,25.3,132.3,5.0,8.8,28.0,2026.0,
Ajay Mandal,DC,AR,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/1931.png",8.0,4.0,100.0,1.0,10.0,2.0,,
Ajinkya Rahane,KKR,BAT,India,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/44.png",3920.0,31.36,122.4,0.0,0.0,170.0,2026.0,
Akash Deep,KKR,BOWL,,₹1.00Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/akash-deep.png",22.0,5.5,91.7,10.0,9.5,14.0,,
Akash Singh,LSG,BOWL,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/535.png",10.0,3.3,76.9,9.0,10.0,10.0,,
Akeal Hosein,CSK,AR,,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",0.0,0.0,0.0,0.0,0.0,0.0,,
Akshat Raghuwanshi,LSG,BAT,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",0.0,0.0,0.0,0.0,0.0,0.0,,
Allah Ghazanfar,MI,BOWL,,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/96648.png",5.0,5.0,100.0,8.0,8.2,6.0,,
Aman Khan,CSK,AR,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Aman-Hakim-Khan.jpg",0.0,0.0,0.0,0.0,0.0,0.0,,
Aman Rao Perala,RR,BAT,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",0.0,0.0,0.0,0.0,0.0,0.0,,
Ambati Rayudu,,Batter,India,,https://commons.wikimedia.org/w/index.php?search=Ambati+Rayudu&title=Special:MediaSearch&type=image,,,,,,,2026.0,
Amit Kumar,SRH,BAT,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",0.0,0.0,0.0,0.0,0.0,0.0,,
Andre Russell,,All-Rounder,West Indies,,https://commons.wikimedia.org/w/index.php?search=Andre+Russell&title=Special:MediaSearch&type=image,,,,,,,2022.0,
Angkrish Raghuvanshi,KKR,BAT,India,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/787.png",88.0,17.6,129.4,0.0,0.0,7.0,2023.0,
Aniket Verma,SRH,AR,,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/3576.png",18.0,9.0,120.0,0.0,0.0,4.0,,
Anrich Nortje,LSG,BOWL,South Africa,₹1.00Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/anrich-nortje.png",22.0,5.5,110.0,47.0,8.4,44.0,2025.0,
Anshul Kamboj,CSK,AR,,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/3106.png",45.0,15.0,128.6,10.0,8.9,11.0,,
Anuj Rawat,GT,WK,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/534.png",315.0,19.7,132.4,0.0,0.0,26.0,,
Anukul Roy,KKR,AR,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/160.png",50.0,12.5,102.0,5.0,8.4,12.0,,
Arjun Tendulkar,LSG,AR,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/arjun-tendulkar.png",8.0,4.0,80.0,2.0,11.0,5.0,,
Arshad Khan,GT,BOWL,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/988.png",5.0,5.0,100.0,4.0,9.0,5.0,,
Arshdeep Singh,PBKS,BOWL,India,₹2.00Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/125.png",14.0,3.5,77.8,76.0,8.9,65.0,2024.0,
Arshin Kulkarni,LSG,AR,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/2788.png",35.0,11.7,125.0,2.0,8.5,5.0,,
Ashok Sharma,GT,BOWL,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/91316.webp",0.0,0.0,0.0,1.0,9.5,2.0,,
Ashutosh Sharma,DC,AR,India,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/3109.png",122.0,24.4,170.0,0.0,0.0,8.0,2026.0,
Ashwani Kumar,MI,BOWL,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/3569.png",0.0,0.0,0.0,1.0,10.5,2.0,,
Atharva Ankolekar,MI,AR,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",0.0,0.0,0.0,0.0,0.0,0.0,,
Auqib Dar,DC,AR,,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/b1ae265576e31748f8e3d93c8de2a581.jpg",0.0,0.0,0.0,0.0,0.0,0.0,,
Avesh Khan,LSG,BOWL,India,₹1.00Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/109.png",22.0,4.4,81.5,60.0,9.4,58.0,2025.0,
Axar Patel,DC,AR,India,₹2.00Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/110.png",1542.0,24.87,138.0,89.0,7.3,132.0,2025.0,
Ayush Badoni,LSG,BAT,India,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/985.png",824.0,25.75,140.5,0.0,0.0,40.0,2026.0,
Ayush Mhatre,CSK,BAT,,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/3497.png",0.0,0.0,0.0,0.0,0.0,0.0,,
Azmatullah Omarzai,PBKS,AR,Afghanistan,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/1354.png",84.0,16.8,152.7,4.0,10.0,7.0,2026.0,
Ben Duckett,DC,BAT,,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/110.png",55.0,13.8,131.0,0.0,0.0,5.0,,
Ben Dwarshuis,PBKS,BOWL,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/770-camedia.png",0.0,0.0,0.0,0.0,0.0,0.0,,
Ben Stokes,,All-Rounder,England,,https://commons.wikimedia.org/w/index.php?search=Ben+Stokes&title=Special:MediaSearch&type=image,,,,,,,2024.0,
Bhuvneshwar Kumar,RCB,BOWL,India,₹1.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/15.png",317.0,11.3,103.3,181.0,7.4,176.0,2026.0,
Brijesh Sharma,RR,WK,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",0.0,0.0,0.0,0.0,0.0,0.0,,
Brydon Carse,SRH,AR,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/65090.webp",25.0,12.5,138.9,4.0,9.5,4.0,,
Cameron Green,KKR,AR,Australia,₹2.00Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/66870.webp",242.0,26.9,143.2,4.0,9.8,11.0,2021.0,
Chris Gayle,,Batter,West Indies,,https://commons.wikimedia.org/w/index.php?search=Chris+Gayle&title=Special:MediaSearch&type=image,,,,,,,2023.0,
Cooper Connolly,PBKS,AR,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/3,958-camedia.png",0.0,0.0,0.0,0.0,0.0,0.0,,
Corbin Bosch,MI,AR,,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/63605.webp",30.0,15.0,150.0,3.0,9.5,3.0,,
Daksh Kamra,KKR,WK,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",0.0,0.0,0.0,0.0,0.0,0.0,,
Danish Malewar,MI,BAT,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",0.0,0.0,0.0,0.0,0.0,0.0,,
David Miller,DC,BAT,South Africa,₹1.00Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/david-miller.png",3020.0,35.93,139.3,1.0,12.0,130.0,2026.0,
David Warner,,Batter,Australia,,https://commons.wikimedia.org/w/index.php?search=David+Warner&title=Special:MediaSearch&type=image,,,,,,,2025.0,
`;

export const CSV_PART2 = `Deepak Chahar,MI,BOWL,India,₹1.00Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/91.png",203.0,13.5,120.2,83.0,7.8,92.0,2026.0,
Deepak Hooda,,All-Rounder,India,,https://commons.wikimedia.org/w/index.php?search=Deepak+Hooda&title=Special:MediaSearch&type=image,,,,,,,2026.0,
Devdutt Padikkal,RCB,BAT,India,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/200.png",1354.0,28.21,127.4,0.0,0.0,58.0,2022.0,
Devon Conway,,WK-Batter,New Zealand,,https://commons.wikimedia.org/w/index.php?search=Devon+Conway&title=Special:MediaSearch&type=image,,,,,,,2026.0,
Dewald Brevis,CSK,BAT,,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/797.png",199.0,22.1,155.5,0.0,0.0,14.0,,
Dhruv Jurel,RR,WK,India,₹1.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/1004.png",252.0,25.2,150.0,0.0,0.0,16.0,2025.0,
Digvesh Rathi,LSG,BOWL,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/3565.png",5.0,5.0,100.0,6.0,8.0,8.0,,
Dinesh Karthik,,WK-Batter,India,,https://commons.wikimedia.org/w/index.php?search=Dinesh+Karthik&title=Special:MediaSearch&type=image,,,,,,,2022.0,
Donovan Ferreira,RR,WK,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/23487.webp",127.0,21.2,142.7,0.0,0.0,10.0,,
Dushmantha Chameera,DC,BOWL,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/608.png",10.0,5.0,83.3,12.0,8.9,10.0,,
Dwayne Bravo,,All-Rounder,West Indies,,https://commons.wikimedia.org/w/index.php?search=Dwayne+Bravo&title=Special:MediaSearch&type=image,,,,,,,2026.0,
Eshan Malinga,SRH,BOWL,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/3339.png",0.0,0.0,0.0,1.0,10.0,2.0,,
Faf du Plessis,,Batter,South Africa,,https://commons.wikimedia.org/w/index.php?search=Faf+du+Plessis&title=Special:MediaSearch&type=image,,,,,,,2026.0,
Finn Allen,KKR,BAT,,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/66046.webp",336.0,22.4,161.5,0.0,0.0,18.0,,
Gerald Coetzee,,Bowler,South Africa,,https://commons.wikimedia.org/w/index.php?search=Gerald+Coetzee&title=Special:MediaSearch&type=image,,,,,,,2022.0,
Glenn Maxwell,,All-Rounder,Australia,,https://commons.wikimedia.org/w/index.php?search=Glenn+Maxwell&title=Special:MediaSearch&type=image,,,,,,,2022.0,
Glenn Phillips,GT,WK,,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/635.png",283.0,20.2,154.6,4.0,8.0,18.0,,
Gurjapneet Singh,CSK,BOWL,,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/2256.png",2.0,2.0,66.7,4.0,9.1,6.0,,
Gurnoor Brar,GT,AR,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/1231.png",12.0,6.0,92.3,5.0,8.8,8.0,,
Hardik Pandya,MI,AR,India,₹2.00Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/54.png",2525.0,28.06,146.3,86.0,8.9,131.0,2026.0,
Harnoor Singh,PBKS,BAT,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",15.0,7.5,110.0,0.0,0.0,3.0,,
Harpreet Brar,PBKS,AR,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/130.png",153.0,17.0,128.6,25.0,7.8,35.0,,
Harsh Dubey,SRH,AR,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",0.0,0.0,0.0,0.0,0.0,0.0,,
Harshal Patel,SRH,BOWL,India,₹1.00Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/114.png",482.0,13.39,119.8,136.0,8.5,114.0,2022.0,
Harshit Rana,KKR,BOWL,India,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/1013.png",28.0,9.3,127.3,19.0,9.7,17.0,2023.0,
Heinrich Klaasen,SRH,WK,South Africa,₹2.00Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/202.png",1385.0,38.47,171.0,0.0,0.0,42.0,2026.0,
Himmat Singh,LSG,BAT,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/203.png",42.0,10.5,117.0,0.0,0.0,6.0,,
Imran Tahir,,Bowler,South Africa,,https://commons.wikimedia.org/w/index.php?search=Imran+Tahir&title=Special:MediaSearch&type=image,,,,,,,2026.0,
Ishan Kishan,SRH,WK,India,₹1.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/164.png",2644.0,28.73,135.9,0.0,0.0,105.0,2026.0,
Ishant Sharma,GT,BOWL,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/50.png",81.0,7.4,100.0,73.0,8.3,93.0,,
Jack Edwards,SRH,AR,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/1,692-camedia.png",0.0,0.0,0.0,0.0,0.0,0.0,,
Jacob Bethell,RCB,AR,,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/869.png",30.0,15.0,150.0,1.0,8.5,3.0,,
Jake Fraser-McGurk,,Batter,Australia,,https://commons.wikimedia.org/w/index.php?search=Jake+Fraser-McGurk&title=Special:MediaSearch&type=image,,,,,,,2026.0,
Jamie Overton,CSK,AR,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/1216.png",51.0,17.0,170.0,4.0,10.5,5.0,,
Jason Holder,GT,AR,,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/10232.webp",547.0,22.0,137.6,40.0,9.2,46.0,,
Jasprit Bumrah,MI,BOWL,India,₹2.00Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/9.png",56.0,7.0,82.4,165.0,7.4,133.0,2026.0,
Jayant Yadav,GT,AR,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/165.png",136.0,12.4,99.3,16.0,7.9,35.0,,
Jaydev Unadkat,SRH,BOWL,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/180.png",130.0,8.67,108.3,93.0,8.6,103.0,,
Jitesh Sharma,RCB,WK,India,₹1.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/1000.png",553.0,24.04,155.2,0.0,0.0,39.0,2022.0,
Jofra Archer,RR,BOWL,England,₹1.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/181.png",73.0,12.2,141.0,46.0,7.1,35.0,2024.0,
Jonny Bairstow,,WK-Batter,England,,https://commons.wikimedia.org/w/index.php?search=Jonny+Bairstow&title=Special:MediaSearch&type=image,,,,,,,2024.0,
Jordan Cox,RCB,WK,,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/75250.png",0.0,0.0,0.0,0.0,0.0,0.0,,
Jos Buttler,GT,WK,England,₹2.00Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/182.png",2838.0,38.89,150.9,0.0,0.0,82.0,2024.0,
Josh Hazlewood,RCB,BOWL,Australia,₹1.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/36.png",24.0,6.0,75.0,37.0,8.2,33.0,2026.0,
Josh Inglis,LSG,WK,,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/65893.webp",28.0,14.0,140.0,0.0,0.0,3.0,,
Joshua Little,,Bowler,Ireland,,https://commons.wikimedia.org/w/index.php?search=Joshua+Little&title=Special:MediaSearch&type=image,,,,,,,2026.0,
KL Rahul,DC,WK,India,₹1.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/19.png",4683.0,45.47,134.6,0.0,0.0,132.0,2023.0,
Kagiso Rabada,GT,BOWL,South Africa,₹1.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/116.png",102.0,8.5,111.0,81.0,8.3,67.0,2024.0,
Kamindu Mendis,SRH,AR,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/627.png",42.0,14.0,127.3,2.0,7.5,5.0,,
Kane Williamson,,Batter,New Zealand,,https://commons.wikimedia.org/w/index.php?search=Kane+Williamson&title=Special:MediaSearch&type=image,,,,,,,2026.0,
Kanishk Chouhan,RCB,BOWL,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",0.0,0.0,0.0,0.0,0.0,0.0,,
Kartik Sharma,CSK,BOWL,,₹1.00Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/bb7ece32c4f99ad75f90d75898f555d1.jpg",0.0,0.0,0.0,0.0,0.0,0.0,,
Kartik Tyagi,KKR,BOWL,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",0.0,0.0,0.0,0.0,0.0,0.0,,
Karun Nair,DC,BAT,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/131.png",496.0,22.55,126.5,0.0,0.0,52.0,,
Khaleel Ahmed,CSK,BOWL,India,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/8.png",32.0,5.3,88.9,89.0,8.8,71.0,2026.0,
Kieron Pollard,,All-Rounder,West Indies,,https://commons.wikimedia.org/w/index.php?search=Kieron+Pollard&title=Special:MediaSearch&type=image,,,,,,,2026.0,
Krains Fuletra,SRH,BOWL,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",0.0,0.0,0.0,0.0,0.0,0.0,,
Krunal Pandya,RCB,AR,India,₹1.00Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/17.png",1327.0,22.5,124.5,67.0,7.4,122.0,2026.0,
`;
export const CSV_PART3 = `Kuldeep Sen,RR,BOWL,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/1005.png",8.0,4.0,88.9,6.0,10.5,7.0,,
Kuldeep Yadav,DC,BOWL,India,₹1.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/14.png",91.0,7.0,95.8,82.0,8.1,75.0,2025.0,
Kumar Kushagra,GT,WK,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/3101.png",42.0,14.0,127.3,0.0,0.0,5.0,,
Kwena Maphaka,RR,BOWL,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/801.png",0.0,0.0,0.0,4.0,11.2,3.0,,
Kyle Jamieson,DC,AR,,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/110.png",92.0,15.3,131.4,12.0,9.8,14.0,,
Lhuan-dre Pretorius,RR,AR,,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",0.0,0.0,0.0,0.0,0.0,0.0,,
Liam Livingstone,SRH,AR,England,₹1.00Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/33.png",437.0,20.8,156.8,7.0,8.8,26.0,2024.0,
Lockie Ferguson,PBKS,BOWL,,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/63719.webp",18.0,6.0,112.5,42.0,8.4,37.0,,
Luke Wood,GT,BOWL,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/1554.png",0.0,0.0,0.0,0.0,0.0,0.0,,
Lungi Ngidi,DC,BOWL,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/99.png",22.0,7.3,88.0,25.0,8.8,22.0,,
M Siddharth,LSG,BOWL,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/532.png",10.0,5.0,83.3,15.0,7.5,12.0,,
MS Dhoni,CSK,WK,India,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/57.png",5243.0,38.54,135.9,0.0,0.0,264.0,2026.0,
Madhav Tiwari,DC,AR,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/3561.png",10.0,5.0,100.0,0.0,0.0,2.0,,
Maheesh Theekshana,,Bowler,Sri Lanka,,https://commons.wikimedia.org/w/index.php?search=Maheesh+Theekshana&title=Special:MediaSearch&type=image,,,,,,,2026.0,
Manav Suthar,GT,BOWL,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/2443.png",5.0,5.0,71.4,4.0,7.8,5.0,,
Mangesh Yadav,RCB,BOWL,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",0.0,0.0,0.0,0.0,0.0,0.0,,
Manish Pandey,KKR,BAT,India,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/16.png",3563.0,29.69,121.7,0.0,0.0,173.0,2026.0,
Marco Jansen,PBKS,AR,South Africa,₹1.00Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/586.png",210.0,17.5,141.9,20.0,9.2,19.0,2024.0,
Marcus Stoinis,PBKS,AR,Australia,₹1.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/23.png",1270.0,26.46,139.2,31.0,9.1,65.0,2025.0,
Matheesha Pathirana,KKR,BOWL,Sri Lanka,₹1.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/matheesha-pathirana.png",4.0,2.0,66.7,33.0,8.3,26.0,2026.0,
Matt Henry,CSK,BOWL,,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/60544.webp",10.0,5.0,83.3,10.0,8.5,8.0,,
Matthew Breetzke,LSG,BAT,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/2805.png",20.0,10.0,111.1,0.0,0.0,3.0,,
Matthew Short,CSK,AR,,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/63846.webp",82.0,20.5,148.2,1.0,9.0,5.0,,
Mayank Agarwal,,Batter,India,,https://commons.wikimedia.org/w/index.php?search=Mayank+Agarwal&title=Special:MediaSearch&type=image,,,,,,,2023.0,
Mayank Markande,MI,BOWL,India,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/67126.webp",15.0,5.0,93.8,17.0,8.2,24.0,2026.0,
Mayank Rawat,MI,WK,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",0.0,0.0,0.0,0.0,0.0,0.0,,
Mayank Yadav,LSG,BOWL,India,₹1.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/mayank-yadav.png",5.0,5.0,100.0,7.0,7.5,4.0,2026.0,
Mitch Owen,PBKS,AR,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",0.0,0.0,0.0,0.0,0.0,0.0,,
Mitchell Marsh,LSG,AR,Australia,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/40.png",422.0,26.38,142.2,7.0,9.0,22.0,2025.0,
Mitchell Santner,MI,AR,,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/75.png",236.0,19.7,114.1,26.0,7.3,36.0,,
Mitchell Starc,DC,BOWL,Australia,₹1.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/31.png",110.0,9.2,118.3,34.0,8.7,30.0,2023.0,
Moeen Ali,,All-Rounder,England,,https://commons.wikimedia.org/w/index.php?search=Moeen+Ali&title=Special:MediaSearch&type=image,,,,,,,2026.0,
Mohammad Izhar,MI,BOWL,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",0.0,0.0,0.0,0.0,0.0,0.0,,
Mohammed Shami,LSG,BOWL,India,₹1.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/94_compress.png",44.0,5.5,97.8,120.0,8.1,101.0,2024.0,
Mohammed Siraj,GT,BOWL,India,₹1.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/63.png",32.0,5.3,78.1,72.0,8.7,80.0,2022.0,
Mohit Sharma,,Bowler,India,,https://commons.wikimedia.org/w/index.php?search=Mohit+Sharma&title=Special:MediaSearch&type=image,,,,,,,2026.0,
Mohsin Khan,LSG,BOWL,India,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/541.png",2.0,1.0,50.0,14.0,7.2,11.0,2026.0,
Mukesh Choudhary,CSK,BOWL,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/970.png",18.0,6.0,100.0,23.0,9.5,20.0,,
Mukesh Kumar,DC,BOWL,India,₹1.00Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/1462.png",8.0,4.0,80.0,21.0,9.3,24.0,2026.0,
Mukul Choudhary,LSG,BOWL,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",0.0,0.0,0.0,0.0,0.0,0.0,,
Musheer Khan,PBKS,AR,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/2813.png",15.0,7.5,115.4,0.0,0.0,3.0,,
Mustafizur Rahman,KKR,BOWL,Bangladesh,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/258.png",35.0,5.8,89.7,35.0,8.5,40.0,2026.0,
Naman Dhir,MI,AR,India,₹1.00Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/3107.png",42.0,21.0,140.0,0.0,0.0,4.0,2022.0,
Naman Tiwari,LSG,AR,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",0.0,0.0,0.0,0.0,0.0,0.0,,
Nandre Burger,RR,BOWL,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/2806.png",0.0,0.0,0.0,0.0,0.0,0.0,,
Nathan Ellis,CSK,BOWL,,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/633.png",28.0,9.3,121.7,22.0,9.2,21.0,,
Naveen-ul-Haq,,Bowler,Afghanistan,,https://commons.wikimedia.org/w/index.php?search=Naveen-ul-Haq&title=Special:MediaSearch&type=image,,,,,,,2026.0,
Nehal Wadhera,PBKS,BAT,India,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/1541.png",172.0,21.5,137.6,0.0,0.0,12.0,2024.0,
Nicholas Pooran,LSG,WK,West Indies,₹2.00Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/136.png",1920.0,28.66,156.5,0.0,0.0,78.0,2023.0,
Nishant Sindhu,GT,AR,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/791.png",51.0,10.2,104.1,4.0,8.6,9.0,,
Nitish Kumar Reddy,SRH,AR,India,₹1.00Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/1944.png",380.0,27.1,143.4,3.0,9.5,16.0,2026.0,
Nitish Rana,DC,BAT,India,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/148.png",2443.0,24.67,133.4,13.0,8.1,109.0,2023.0,
Noor Ahmad,CSK,BOWL,Afghanistan,₹1.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/975.png",2.0,2.0,66.7,15.0,7.8,12.0,2026.0,
Nuwan Thushara,RCB,BOWL,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/813.png",0.0,0.0,0.0,12.0,9.4,10.0,,
Onkar Tarmale,SRH,BOWL,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",0.0,0.0,0.0,0.0,0.0,0.0,,
Pat Cummins,SRH,BOWL,Australia,₹2.00Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/33.png",491.0,20.46,145.1,42.0,8.9,38.0,2023.0,
Pathum Nissanka,DC,BAT,,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/66368.webp",45.0,15.0,128.6,0.0,0.0,4.0,,
Phil Salt,RCB,WK,England,₹1.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/1220.png",435.0,31.07,167.3,0.0,0.0,15.0,2022.0,
Piyush Chawla,,Bowler,India,,https://commons.wikimedia.org/w/index.php?search=Piyush+Chawla&title=Special:MediaSearch&type=image,,,,,,,2021.0,
Prabhsimran Singh,PBKS,WK,India,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/137.png",348.0,23.2,158.9,0.0,0.0,21.0,2024.0,
Praful Hinge,SRH,WK,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",0.0,0.0,0.0,0.0,0.0,0.0,,
Prashant Solanki,KKR,BOWL,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",0.0,0.0,0.0,0.0,0.0,0.0,,
Prashant Veer,CSK,AR,,₹1.00Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/befunky-collage-2-1765884737.webp",0.0,0.0,0.0,0.0,0.0,0.0,,
Prasidh Krishna,GT,BOWL,,₹1.00Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/150.png",18.0,4.5,81.8,33.0,9.2,30.0,,
Pravin Dubey,PBKS,AR,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/548.png",22.0,7.3,100.0,6.0,8.5,12.0,,
Prince Yadav,LSG,BOWL,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/1225.png",5.0,5.0,83.3,2.0,9.0,3.0,,
Prithvi Raj Yarra,GT,AR,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",0.0,0.0,0.0,0.0,0.0,0.0,,
Prithvi Shaw,DC,BAT,India,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/51.png",1588.0,24.43,149.4,0.0,0.0,67.0,2025.0,
`;
export const CSV_PART4 = `Priyansh Arya,PBKS,BAT,,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/3571.png",35.0,11.7,145.8,0.0,0.0,5.0,,
Pyla Avinash,PBKS,BAT,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/3573.png",10.0,5.0,100.0,0.0,0.0,2.0,,
Quinton de Kock,MI,WK,South Africa,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/28035.webp",3157.0,30.35,137.2,0.0,0.0,107.0,2021.0,
R Sai Kishore,GT,BOWL,,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/544.png",22.0,5.5,84.6,17.0,7.3,22.0,,
Rachin Ravindra,KKR,AR,New Zealand,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/66053.webp",111.0,22.2,125.8,2.0,8.1,6.0,2026.0,
Raghu Sharma,MI,BOWL,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",0.0,0.0,0.0,0.0,0.0,0.0,,
Rahmanullah Gurbaz,,WK-Batter,Afghanistan,,https://commons.wikimedia.org/w/index.php?search=Rahmanullah+Gurbaz&title=Special:MediaSearch&type=image,,,,,,,2023.0,
Rahul Chahar,CSK,BOWL,India,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/102.png",42.0,7.0,110.5,72.0,8.1,68.0,2021.0,
Rahul Tewatia,GT,AR,India,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/120.png",1264.0,24.31,138.9,21.0,8.4,90.0,2025.0,
Rahul Tripathi,KKR,BAT,India,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/36296154187d2cfdf956fc82eff2f45f.jpg",2313.0,27.5,140.3,0.0,0.0,93.0,2026.0,
Raj Bawa,MI,AR,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/781.png",45.0,11.3,106.0,3.0,10.2,8.0,,
Rajat Patidar,RCB,BAT,India,₹1.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/597.png",807.0,32.28,155.2,0.0,0.0,33.0,2022.0,
Ramakrishna Ghosh,CSK,WK,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/3559.png",8.0,8.0,100.0,0.0,0.0,2.0,,
Ramandeep Singh,KKR,AR,India,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/991.png",225.0,18.8,149.0,2.0,12.0,24.0,2023.0,
Rashid Khan,GT,BOWL,Afghanistan,₹2.00Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/218.png",688.0,17.2,146.5,119.0,6.6,119.0,2026.0,
Rasikh Dar,RCB,BOWL,,₹1.00Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/1932.png",2.0,2.0,66.7,8.0,9.0,7.0,,
Ravi Bishnoi,RR,BOWL,India,₹1.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/71288.webp",16.0,4.0,72.7,56.0,7.8,55.0,2024.0,
Ravi Singh,RR,BAT,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",0.0,0.0,0.0,0.0,0.0,0.0,,
Ravichandran Ashwin,,All-Rounder,India,,https://commons.wikimedia.org/w/index.php?search=Ravichandran+Ashwin&title=Special:MediaSearch&type=image,,,,,,,2025.0,
Ravindra Jadeja,RR,AR,India,₹2.00Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/ravindra-jadeja.png",2692.0,27.2,127.8,152.0,7.6,226.0,2026.0,
Rinku Singh,KKR,BAT,India,₹1.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/152.png",1197.0,36.27,149.4,0.0,0.0,52.0,2023.0,
Rishabh Pant,LSG,WK,India,₹2.00Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/18.png",3284.0,34.57,148.7,0.0,0.0,111.0,2025.0,
Riyan Parag,RR,AR,India,₹1.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/189.png",1185.0,28.17,148.7,14.0,8.9,60.0,2025.0,
Robin Minz,MI,WK,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/3103.png",32.0,16.0,145.5,0.0,0.0,4.0,,
Rohit Sharma,MI,BAT,India,₹2.00Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/6.png",6628.0,29.34,130.6,15.0,8.5,257.0,2026.0,
Romario Shepherd,RCB,AR,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/371.png",210.0,17.5,147.9,15.0,10.1,21.0,,
Rovman Powell,KKR,BAT,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/329.png",443.0,20.1,148.5,0.0,0.0,36.0,,
Ruturaj Gaikwad,CSK,BAT,India,₹2.00Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/102.png",2635.0,37.64,136.2,0.0,0.0,82.0,2026.0,
Ryan Rickelton,MI,BAT,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/743.png",90.0,18.0,130.0,0.0,0.0,6.0,,
Sahil Parakh,DC,BAT,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",0.0,0.0,0.0,0.0,0.0,0.0,,
Sai Sudharsan,GT,BAT,India,₹1.00Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/976.png",920.0,36.8,132.2,0.0,0.0,32.0,2026.0,
Sakib Hussain,SRH,BOWL,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/08a01b06351be8b9709b95d7d693aca7.jpg",0.0,0.0,0.0,0.0,0.0,0.0,,
Salil Arora,SRH,AR,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",0.0,0.0,0.0,0.0,0.0,0.0,,
Sam Curran,RR,AR,England,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/65584.webp",893.0,22.33,143.4,47.0,8.8,58.0,2026.0,
Sameer Rizvi,DC,AR,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/1229.png",71.0,14.2,132.1,0.0,0.0,7.0,,
Sandeep Sharma,RR,BOWL,India,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/189.png",38.0,5.4,79.2,113.0,7.7,104.0,2025.0,
Sanju Samson,CSK,WK,India,₹2.00Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/61837.webp",4473.0,29.29,136.8,0.0,0.0,174.0,2024.0,
Sarfaraz Khan,CSK,BAT,,₹1.00Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/63962.webp",311.0,25.9,132.5,0.0,0.0,22.0,,
Sarthak Ranjan,KKR,AR,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",0.0,0.0,0.0,0.0,0.0,0.0,,
Satvik Deswal,RCB,WK,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",0.0,0.0,0.0,0.0,0.0,0.0,,
Shahbaz Ahmed,LSG,AR,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/523.png",497.0,19.12,125.3,20.0,8.2,45.0,,
Shahrukh Khan,GT,BAT,India,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/590.png",426.0,19.4,139.2,0.0,0.0,40.0,2024.0,
Shardul Thakur,MI,AR,India,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/105.png",584.0,16.2,134.9,89.0,8.9,102.0,2026.0,
Shashank Singh,PBKS,AR,India,₹1.00Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/191.png",455.0,32.5,163.3,0.0,0.0,31.0,2024.0,
Sherfane Rutherford,MI,BAT,,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/17224.png",318.0,22.7,153.6,0.0,0.0,24.0,,
Shikhar Dhawan,,Batter,India,,https://commons.wikimedia.org/w/index.php?search=Shikhar+Dhawan&title=Special:MediaSearch&type=image,,,,,,,2024.0,
Shimron Hetmyer,RR,BAT,West Indies,₹1.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/210.png",1414.0,28.85,155.0,0.0,0.0,72.0,2025.0,
Shivam Dube,CSK,AR,India,₹1.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/211.png",1503.0,30.06,142.5,16.0,9.2,80.0,2026.0,
Shivam Mavi,SRH,BOWL,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/66984.webp",0.0,0.0,0.0,0.0,0.0,0.0,,
Shivang Kumar,SRH,AR,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",0.0,0.0,0.0,0.0,0.0,0.0,,
Shreyas Gopal,CSK,BOWL,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/192.png",180.0,13.8,115.4,44.0,8.0,56.0,,
Shreyas Iyer,PBKS,BAT,India,₹2.00Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/12.png",3127.0,32.24,127.7,0.0,0.0,115.0,2022.0,
Shubham Dubey,RR,BAT,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/3112.png",35.0,11.7,134.6,0.0,0.0,5.0,,
Shubman Gill,GT,BAT,India,₹2.00Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/62.png",2753.0,35.3,136.2,0.0,0.0,82.0,2023.0,
Smaran Ravichandran,SRH,BAT,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",0.0,0.0,0.0,0.0,0.0,0.0,,
Spencer Johnson,,Bowler,Australia,,https://commons.wikimedia.org/w/index.php?search=Spencer+Johnson&title=Special:MediaSearch&type=image,,,,,,,2026.0,
Steve Smith,,Batter,Australia,,https://commons.wikimedia.org/w/index.php?search=Steve+Smith&title=Special:MediaSearch&type=image,,,,,,,2024.0,
Sunil Narine,KKR,AR,West Indies,₹1.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/156.png",4012.0,22.8,162.7,177.0,6.7,195.0,2023.0,
Suryakumar Yadav,MI,BAT,India,₹2.00Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/174.png",3228.0,31.34,147.1,0.0,0.0,145.0,2026.0,
Suryansh Shedge,PBKS,AR,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/2146.png",25.0,12.5,138.9,1.0,9.0,4.0,,
Sushant Mishra,RR,BOWL,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",0.0,0.0,0.0,0.0,0.0,0.0,,
Suyash Sharma,RCB,BOWL,,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/1932.png",2.0,2.0,66.7,5.0,8.0,6.0,,
Swapnil Singh,RCB,AR,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/1483.png",47.0,9.4,109.3,13.0,7.9,17.0,,
T Natarajan,DC,BOWL,India,₹1.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/224.png",37.0,6.2,97.4,56.0,8.7,52.0,2026.0,
Tejasvi Singh,KKR,BAT,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",0.0,0.0,0.0,0.0,0.0,0.0,,
Tilak Varma,MI,BAT,India,₹1.00Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/993.png",994.0,31.06,142.3,0.0,0.0,41.0,2021.0,
Tim David,RCB,BAT,Australia,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/636.png",595.0,23.8,158.7,0.0,0.0,36.0,2021.0,
Tim Seifert,KKR,WK,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/44.png",67.0,13.4,121.8,0.0,0.0,8.0,,
Tom Banton,GT,BAT,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/66923.webp",0.0,0.0,0.0,0.0,0.0,0.0,,
Travis Head,SRH,BAT,Australia,₹1.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/37.png",567.0,40.5,191.6,1.0,8.0,15.0,2026.0,
Trent Boult,MI,BOWL,New Zealand,₹1.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/66.png",94.0,7.8,104.4,107.0,8.1,93.0,2021.0,
Tripurana Vijay,DC,AR,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/3563.png",5.0,5.0,100.0,0.0,0.0,1.0,,
Tristan Stubbs,DC,BAT,South Africa,₹1.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/1017.png",341.0,24.4,157.4,0.0,0.0,22.0,2026.0,
Tushar Deshpande,RR,BOWL,India,₹1.00Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/539.png",20.0,5.0,105.3,37.0,9.7,37.0,2026.0,
Umran Malik,KKR,BOWL,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/540f7e7b0ac3835ea07923d3c8624d16.jpg",18.0,6.0,100.0,27.0,10.1,28.0,,
Urvil Patel,CSK,WK,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/1486.png",0.0,0.0,0.0,0.0,0.0,0.0,,
Vaibhav Arora,KKR,BOWL,India,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/583.png",10.0,5.0,90.9,14.0,9.0,15.0,2023.0,
Vaibhav Suryavanshi,RR,BAT,India,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/3498.png",68.0,17.0,158.1,0.0,0.0,5.0,2025.0,
Varun Chakaravarthy,KKR,BOWL,,₹1.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/140.png",14.0,4.7,63.6,73.0,7.3,62.0,,
Varun Chakravarthy,,Bowler,India,,https://commons.wikimedia.org/w/index.php?search=Varun+Chakravarthy&title=Special:MediaSearch&type=image,,,,,,,2023.0,
Venkatesh Iyer,RCB,AR,India,₹2.00Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/venkatesh-iyer.png",1154.0,26.23,131.5,7.0,9.5,62.0,2023.0,
Vicky Ostwal,RCB,BOWL,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",0.0,0.0,0.0,0.0,0.0,0.0,,
Vignesh Puthur,RR,AR,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/83549.png",5.0,5.0,100.0,0.0,0.0,1.0,,
Vihaan Malhotra,RCB,BAT,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",0.0,0.0,0.0,0.0,0.0,0.0,,
Vijay Shankar,,All-Rounder,India,,https://commons.wikimedia.org/w/index.php?search=Vijay+Shankar&title=Special:MediaSearch&type=image,,,,,,,2026.0,
Vipraj Nigam,DC,AR,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/3560.png",15.0,7.5,107.0,1.0,9.0,3.0,,
Virat Kohli,RCB,BAT,India,₹2.00Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/2.png",8004.0,37.57,131.6,4.0,8.7,252.0,2022.0,
Vishal Nishad,PBKS,WK,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",0.0,0.0,0.0,0.0,0.0,0.0,,
Vishnu Vinod,PBKS,WK,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/581.png",108.0,15.4,157.4,0.0,0.0,11.0,,
Vyshak Vijaykumar,PBKS,BOWL,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/2034.png",4.0,2.0,66.7,14.0,9.3,14.0,,
Wanindu Hasaranga,LSG,AR,Sri Lanka,₹1.00Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/65027.webp",122.0,12.2,138.6,26.0,7.6,21.0,2022.0,
Washington Sundar,GT,AR,,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/20.png",486.0,18.0,116.8,35.0,7.2,60.0,,
Will Jacks,MI,AR,England,₹1.00Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/66927.webp",162.0,27.0,168.8,3.0,8.7,8.0,2022.0,
Wriddhiman Saha,,WK-Batter,India,,https://commons.wikimedia.org/w/index.php?search=Wriddhiman+Saha&title=Special:MediaSearch&type=image,,,,,,,2026.0,
Xavier Bartlett,PBKS,BOWL,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/3572.png",5.0,5.0,100.0,5.0,8.8,5.0,,
Yash Dayal,RCB,BOWL,,₹1.00Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/978.png",18.0,6.0,90.0,32.0,9.2,27.0,,
Yash Raj Punia,RR,BAT,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",0.0,0.0,0.0,0.0,0.0,0.0,,
Yash Thakur,PBKS,BOWL,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/1550.png",20.0,5.0,105.3,10.0,10.3,13.0,,
Yashasvi Jaiswal,RR,BAT,India,₹2.00Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/533.png",2532.0,30.87,153.8,1.0,9.0,58.0,2025.0,
Yudhvir Singh Charak,RR,AR,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/587.png",15.0,7.5,115.0,1.0,9.0,3.0,,
Yuzvendra Chahal,PBKS,BOWL,India,₹2.00Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/10.png",79.0,5.6,75.2,205.0,7.7,160.0,2022.0,
Zak Foulkes,CSK,BOWL,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/90571.webp",0.0,0.0,0.0,0.0,0.0,0.0,,
Zeeshan Ansari,SRH,BOWL,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/3575.png",5.0,5.0,83.3,3.0,7.8,4.0,,
`;




export const CSV_PART5 = `Name,Team,Role,Country,BasePrice,Image,Runs,Average,StrikeRate,Wickets,Economy,Matches,LatestSeason,TeamCode
Srikar Bharat,KKR,WK,,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",199.0,24.9,135.5,0.0,0.0,10.0,2026.0,
Chetan Sakariya,KKR,BOWL,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",21.0,1.4,85.0,20.0,8.2,19.0,2026.0,
Yash Dhull,DC,BAT,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",45.0,14.1,135.5,0.0,0.0,4.0,2026.0,
Rasikh Salam,DC,BOWL,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",10.0,1.1,85.0,9.0,8.2,11.0,2026.0,
Jhye Richardson,DC,BOWL,Australia,₹1.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",15.0,4.7,85.0,3.0,8.2,4.0,2026.0,
Lizaad Williams,DC,BOWL,South Africa,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",0.0,0.0,85.0,3.0,8.2,3.0,2026.0,
Swastik Chikara,DC,BAT,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",5.0,6.3,135.5,0.0,0.0,1.0,2026.0,
Sumit Kumar,DC,AR,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",22.0,4.6,135.5,1.0,8.2,6.0,2026.0,
Lalit Yadav,DC,AR,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",295.0,14.8,135.5,10.0,8.2,25.0,2026.0,
Praveen Dubey,DC,BOWL,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",17.0,5.3,85.0,1.0,8.2,4.0,2026.0,
Rajvardhan Hangargekar,CSK,BOWL,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",0.0,0.0,85.0,3.0,8.2,2.0,2026.0,
Shaik Rasheed,CSK,BAT,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",0.0,0.0,135.5,0.0,0.0,1.0,2026.0,
Richard Gleeson,CSK,BOWL,England,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",0.0,0.0,85.0,2.0,8.2,2.0,2026.0,
Simarjeet Singh,CSK,BOWL,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",12.0,1.5,85.0,9.0,8.2,10.0,2026.0,
Kunal Singh Rathore,RR,WK,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",5.0,6.3,135.5,0.0,0.0,1.0,2026.0,
Kuldeep Sen,RR,BOWL,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",12.0,0.8,85.0,21.0,8.2,19.0,2026.0,
Abid Mushtaq,RR,AR,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",0.0,0.0,135.5,0.0,8.2,1.0,2026.0,
Tom Kohler-Cadmore,RR,BAT,England,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",33.0,13.7,135.5,0.0,0.0,3.0,2026.0,
Tanush Kotian,RR,AR,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",30.0,12.5,135.5,1.0,8.2,3.0,2026.0,
Akash Madhwal,MI,BOWL,,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",4.0,0.3,85.0,19.0,8.2,15.0,2026.0,
Shams Mulani,MI,AR,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",28.0,7.0,135.5,2.0,8.2,5.0,2026.0,
Shivalik Sharma,MI,AR,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",0.0,0.0,135.5,0.0,8.2,1.0,2026.0,
Atharva Taide,PBKS,BAT,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",186.0,23.3,135.5,0.0,0.0,10.0,2026.0,
Rishi Dhawan,PBKS,AR,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",210.0,6.9,135.5,25.0,8.2,38.0,2026.0,
Shivam Singh,PBKS,BAT,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",0.0,0.0,135.5,0.0,0.0,1.0,2026.0,
Vidwath Kaverappa,PBKS,BOWL,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",0.0,0.0,85.0,2.0,8.2,2.0,2026.0,
Harpreet Bhatia,PBKS,BAT,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",77.0,16.0,135.5,0.0,0.0,6.0,2026.0,
Prince Choudhary,PBKS,BOWL,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",0.0,0.0,85.0,0.0,8.2,1.0,2026.0,
Tanay Thyagarajan,PBKS,AR,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",12.0,7.5,135.5,1.0,8.2,2.0,2026.0,
Vishwanath Pratap Singh,PBKS,BAT,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",0.0,0.0,135.5,0.0,0.0,1.0,2026.0,
Sandeep Warrier,GT,BOWL,,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",4.0,0.5,85.0,9.0,8.2,11.0,2026.0,
Darshan Nalkande,GT,BOWL,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",5.0,1.3,85.0,4.0,8.2,5.0,2026.0,
Abhinav Manohar,GT,BAT,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",233.0,15.3,135.5,0.0,0.0,19.0,2026.0,
Suyash Prabhudessai,RCB,BAT,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",102.0,12.8,135.5,0.0,0.0,10.0,2026.0,
Mahipal Lomror,RCB,AR,,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",512.0,16.0,135.5,1.0,8.2,40.0,2026.0,
Karn Sharma,RCB,BOWL,,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",330.0,5.3,85.0,71.0,8.2,78.0,2026.0,
Mayank Dagar,RCB,BOWL,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",20.0,2.5,85.0,5.0,8.2,10.0,2026.0,
Saurav Chauhan,RCB,BAT,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",15.0,6.2,135.5,0.0,0.0,3.0,2026.0,
James Neesham,,AR,New Zealand,₹1.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",92.0,8.2,135.5,8.0,8.2,14.0,2026.0,
Tim Southee,,BOWL,New Zealand,₹1.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",118.0,2.7,85.0,47.0,8.2,54.0,2026.0,
Michael Bracewell,,AR,New Zealand,₹1.00Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",58.0,14.5,135.5,6.0,8.2,5.0,2026.0,
Mark Wood,LSG,BOWL,England,₹2.00Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",0.0,0.0,85.0,11.0,8.2,5.0,2026.0,
Chris Jordan,,BOWL,England,₹1.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",85.0,3.1,85.0,33.0,8.2,34.0,2026.0,
Gus Atkinson,,BOWL,England,₹1.00Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",0.0,0.0,85.0,0.0,8.2,1.0,2026.0,
Adil Rashid,,BOWL,England,₹2.00Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",0.0,0.0,85.0,0.0,8.2,1.0,2026.0,
Dawid Malan,,BAT,England,₹1.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",26.0,32.5,135.5,0.0,0.0,1.0,2026.0,
Alex Hales,,BAT,England,₹1.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",148.0,30.8,135.5,0.0,0.0,6.0,2026.0,
Jason Roy,,BAT,England,₹1.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",614.0,36.5,135.5,0.0,0.0,21.0,2026.0,
Tabraiz Shamsi,,BOWL,South Africa,₹1.00Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",0.0,0.0,85.0,3.0,8.2,5.0,2026.0,
Rassie van der Dussen,,BAT,South Africa,₹2.00Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",22.0,9.2,135.5,0.0,0.0,3.0,2026.0,
Reeza Hendricks,,BAT,South Africa,₹1.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",10.0,12.5,135.5,0.0,0.0,1.0,2026.0,
Dwaine Pretorius,,AR,South Africa,₹1.00Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",44.0,9.2,135.5,6.0,8.2,6.0,2026.0,
Wayne Parnell,,BOWL,South Africa,₹1.00Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",30.0,1.4,85.0,26.0,8.2,26.0,2026.0,
Shakib Al Hasan,,AR,Bangladesh,₹1.00Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",793.0,14.0,135.5,63.0,8.2,71.0,2026.0,
Litton Das,,WK,Bangladesh,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",4.0,5.0,135.5,0.0,0.0,1.0,2026.0,
Taskin Ahmed,,BOWL,Bangladesh,₹1.25Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",1.0,0.6,85.0,2.0,8.2,2.0,2026.0,
Shoriful Islam,,BOWL,Bangladesh,₹0.75Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",0.0,0.0,85.0,1.0,8.2,1.0,2026.0,
Dilshan Madushanka,MI,BOWL,Sri Lanka,₹1.25Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",0.0,0.0,85.0,0.0,8.2,1.0,2026.0,
Chamika Karunaratne,,AR,Sri Lanka,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",0.0,0.0,135.5,0.0,8.2,1.0,2026.0,
Bhanuka Rajapaksa,,BAT,Sri Lanka,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",295.0,24.6,135.5,0.0,0.0,15.0,2026.0,
Blessing Muzarabani,,BOWL,Zimbabwe,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",0.0,0.0,85.0,0.0,8.2,1.0,2026.0,
Richard Ngarava,,BOWL,Zimbabwe,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",0.0,0.0,85.0,0.0,8.2,1.0,2026.0,
Ibrahim Zadran,,BAT,Afghanistan,₹0.75Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",15.0,18.8,135.5,0.0,0.0,1.0,2026.0,
Fazalhaq Farooqi,SRH,BOWL,Afghanistan,₹1.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",1.0,0.2,85.0,6.0,8.2,7.0,2026.0,
Mujeeb Ur Rahman,KKR,BOWL,Afghanistan,₹2.00Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",15.0,1.0,85.0,19.0,8.2,19.0,2026.0,
Brandon King,,BAT,West Indies,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",20.0,25.0,135.5,0.0,0.0,1.0,2026.0,
Kyle Mayers,LSG,AR,West Indies,₹1.00Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",379.0,36.4,135.5,0.0,8.2,13.0,2026.0,
Odean Smith,GT,BOWL,West Indies,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",51.0,10.6,85.0,6.0,8.2,6.0,2026.0,
Dominic Drakes,,AR,West Indies,₹0.75Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",0.0,0.0,135.5,1.0,8.2,1.0,2026.0,
Keemo Paul,,AR,West Indies,₹0.75Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",18.0,2.8,135.5,9.0,8.2,8.0,2026.0,
Fabian Allen,,AR,West Indies,₹0.75Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",6.0,1.9,135.5,2.0,8.2,4.0,2026.0,
Obed McCoy,,BOWL,West Indies,₹1.00Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",0.0,0.0,85.0,11.0,8.2,7.0,2026.0,
Evin Lewis,,BAT,West Indies,₹2.00Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",654.0,30.3,135.5,0.0,0.0,27.0,2026.0,
Sheldon Cottrell,,BOWL,West Indies,₹1.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",0.0,0.0,85.0,6.0,8.2,6.0,2026.0,
Oshane Thomas,,BOWL,West Indies,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",0.0,0.0,85.0,5.0,8.2,4.0,2026.0,
Johnson Charles,,WK,West Indies,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",8.0,10.0,135.5,0.0,0.0,1.0,2026.0,
Roston Chase,,AR,West Indies,₹1.00Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",12.0,15.0,135.5,1.0,8.2,1.0,2026.0,
Hayden Walsh Jr.,,BOWL,West Indies,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",0.0,0.0,85.0,0.0,8.2,1.0,2026.0,
Gudakesh Motie,,BOWL,West Indies,₹0.75Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",0.0,0.0,85.0,0.0,8.2,1.0,2026.0,
Yannic Cariah,,BOWL,West Indies,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",0.0,0.0,85.0,0.0,8.2,1.0,2026.0,
Priyansh Arya,,BAT,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",30.0,37.5,135.5,0.0,0.0,1.0,2026.0,
Baba Indrajith,,BAT,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",15.0,18.8,135.5,0.0,0.0,1.0,2026.0,
Sheldon Jackson,,WK,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",61.0,8.5,135.5,0.0,0.0,9.0,2026.0,
Cheteshwar Pujara,,BAT,,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",390.0,16.3,135.5,0.0,0.0,30.0,2026.0,
Hanuma Vihari,,BAT,,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",284.0,14.8,135.5,1.0,0.0,24.0,2026.0,
Mandeep Singh,,BAT,,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",1705.0,19.2,135.5,1.0,0.0,111.0,2026.0,
Kedar Jadhav,,AR,,₹1.00Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",1208.0,15.9,135.5,4.0,8.2,95.0,2026.0,
Barinder Sran,,BOWL,,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",4.0,0.2,85.0,18.0,8.2,24.0,2026.0,
Sandeep Lamichhane,,BOWL,Nepal,₹0.40Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",0.0,0.0,85.0,13.0,8.2,9.0,2026.0,
Kamlesh Nagarkoti,,BOWL,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",22.0,2.3,85.0,5.0,8.2,12.0,2026.0,
Basil Thampi,,BOWL,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",32.0,1.9,85.0,17.0,8.2,21.0,2026.0,
Jagadeesha Suchith,,BOWL,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",71.0,4.0,85.0,12.0,8.2,22.0,2026.0,
Krishnappa Gowtham,,AR,,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",247.0,8.8,135.5,21.0,8.2,35.0,2026.0,
Pawan Negi,,AR,,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",365.0,9.1,135.5,34.0,8.2,50.0,2026.0,
Rohan Sharma,CSK,BOWL,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",27.0,1.3,85.0,24.0,8.2,27.0,2026.0,
Suresh Sharma,SRH,AR,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",89.0,5.9,135.5,16.0,8.2,19.0,2026.0,
Manish Sharma,MI,WK,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",106.0,12.0,135.5,0.0,0.0,11.0,2026.0,
Ketan Sharma,PBKS,BAT,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",123.0,5.5,135.5,0.0,0.0,28.0,2026.0,
Pranav Sharma,RCB,BOWL,,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",5.0,0.3,85.0,17.0,8.2,20.0,2026.0,
Rishit Sharma,LSG,AR,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",157.0,16.4,135.5,9.0,8.2,12.0,2026.0,
Hrishikesh Sharma,KKR,WK,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",174.0,7.5,135.5,0.0,0.0,29.0,2026.0,
Vivek Sharma,DC,BAT,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",191.0,11.4,135.5,0.0,0.0,21.0,2026.0,
Yashwant Sharma,GT,BOWL,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",13.0,1.3,85.0,10.0,8.2,13.0,2026.0,
Shrey Sharma,,AR,,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",225.0,56.3,135.5,2.0,8.2,5.0,2026.0,
Samarth Sharma,CSK,BAT,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",259.0,23.1,135.5,0.0,0.0,14.0,2026.0,
Siddharth Sharma,SRH,BOWL,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",21.0,4.4,85.0,3.0,8.2,6.0,2026.0,
Aniket Sharma,MI,AR,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",293.0,15.9,135.5,20.0,8.2,23.0,2026.0,
Akash Sharma,PBKS,WK,,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",310.0,25.8,135.5,0.0,0.0,15.0,2026.0,
Kunal Sharma,RCB,BAT,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",327.0,58.4,135.5,0.0,0.0,7.0,2026.0,
Nikhil Sharma,LSG,BOWL,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",29.0,1.5,85.0,21.0,8.2,24.0,2026.0,
Devendra Sharma,KKR,AR,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",361.0,28.2,135.5,13.0,8.2,16.0,2026.0,
Gaurav Sharma,DC,WK,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",378.0,59.1,135.5,0.0,0.0,8.0,2026.0,
Tushar Sharma,GT,BAT,,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",395.0,19.8,135.5,0.0,0.0,25.0,2026.0,
Vikram Sharma,,BOWL,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",7.0,0.5,85.0,14.0,8.2,17.0,2026.0,
Dinesh Sharma,RR,AR,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",429.0,59.6,135.5,6.0,8.2,9.0,2026.0,
Sanjay Sharma,CSK,WK,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",446.0,21.4,135.5,0.0,0.0,26.0,2026.0,
Arun Sharma,SRH,BAT,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",463.0,32.2,135.5,0.0,0.0,18.0,2026.0,
Pankaj Sharma,MI,BOWL,,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",15.0,1.9,85.0,7.0,8.2,10.0,2026.0,
Vijay Sharma,PBKS,AR,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",497.0,23.0,135.5,24.0,8.2,27.0,2026.0,
Rahul Sharma,RCB,WK,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",64.0,4.2,135.5,0.0,0.0,19.0,2026.0,
Mayank Sharma,KKR,BOWL,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",23.0,1.0,85.0,25.0,8.2,28.0,2026.0,
Ashish Sharma,DC,AR,,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",115.0,7.2,135.5,17.0,8.2,20.0,2026.0,
Deepak Sharma,GT,WK,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",132.0,13.7,135.5,0.0,0.0,12.0,2026.0,
Amit Sharma,RR,BOWL,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",31.0,1.8,85.0,18.0,8.2,21.0,2026.0,
Harish Sharma,CSK,AR,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",183.0,17.6,135.5,10.0,8.2,13.0,2026.0,
Sachin Sharma,SRH,WK,,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",200.0,50.0,135.5,0.0,0.0,5.0,2026.0,
Anil Sharma,MI,BAT,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",217.0,12.3,135.5,0.0,0.0,22.0,2026.0,
Rajesh Sharma,PBKS,BOWL,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",9.0,0.8,85.0,11.0,8.2,14.0,2026.0,
Sunil Sharma,RCB,AR,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",251.0,52.3,135.5,3.0,8.2,6.0,2026.0,
Karan Sharma,LSG,WK,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",268.0,14.6,135.5,0.0,0.0,23.0,2026.0,
Aditya Iyer,KKR,BAT,,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",285.0,23.8,135.5,0.0,0.0,15.0,2026.0,
Rohan Iyer,DC,BOWL,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",17.0,3.0,85.0,4.0,8.2,7.0,2026.0,
Suresh Iyer,GT,AR,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",319.0,16.6,135.5,21.0,8.2,24.0,2026.0,
Manish Iyer,,WK,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",336.0,26.3,135.5,0.0,0.0,16.0,2026.0,
Ketan Iyer,RR,BAT,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",353.0,55.2,135.5,0.0,0.0,8.0,2026.0,
Pranav Iyer,CSK,BOWL,,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",25.0,1.3,85.0,22.0,8.2,25.0,2026.0,
Rishit Iyer,SRH,AR,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",387.0,28.5,135.5,14.0,8.2,17.0,2026.0,
Hrishikesh Iyer,MI,WK,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",404.0,56.1,135.5,0.0,0.0,9.0,2026.0,
Vivek Iyer,PBKS,BAT,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",421.0,20.2,135.5,0.0,0.0,26.0,2026.0,
Yashwant Iyer,RCB,BOWL,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",33.0,2.3,85.0,15.0,8.2,18.0,2026.0,
Shrey Iyer,LSG,AR,,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",455.0,56.9,135.5,7.0,8.2,10.0,2026.0,
Mohit Iyer,KKR,WK,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",472.0,21.9,135.5,0.0,0.0,27.0,2026.0,
Samarth Iyer,DC,BAT,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",489.0,32.2,135.5,0.0,0.0,19.0,2026.0,
Siddharth Iyer,GT,BOWL,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",11.0,1.3,85.0,8.0,8.2,11.0,2026.0,
Aniket Iyer,,AR,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",73.0,3.3,135.5,25.0,8.2,28.0,2026.0,
Akash Iyer,RR,WK,,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",90.0,5.6,135.5,0.0,0.0,20.0,2026.0,
Kunal Iyer,CSK,BAT,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",107.0,11.1,135.5,0.0,0.0,12.0,2026.0,
Nikhil Iyer,SRH,BOWL,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",19.0,0.8,85.0,26.0,8.2,29.0,2026.0,
Devendra Iyer,MI,AR,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",141.0,8.4,135.5,18.0,8.2,21.0,2026.0,
Gaurav Iyer,PBKS,WK,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",158.0,15.2,135.5,0.0,0.0,13.0,2026.0,
Tushar Iyer,RCB,BAT,,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",175.0,43.8,135.5,0.0,0.0,5.0,2026.0,
Vikram Iyer,LSG,BOWL,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",27.0,1.5,85.0,19.0,8.2,22.0,2026.0,
Dinesh Iyer,KKR,AR,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",209.0,18.7,135.5,11.0,8.2,14.0,2026.0,
Sanjay Iyer,DC,WK,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",226.0,47.1,135.5,0.0,0.0,6.0,2026.0,
Arun Iyer,GT,BAT,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",243.0,13.2,135.5,0.0,0.0,23.0,2026.0,
Pankaj Iyer,,BOWL,,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",5.0,0.4,85.0,12.0,8.2,15.0,2026.0,
Vijay Iyer,RR,AR,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",277.0,49.5,135.5,4.0,8.2,7.0,2026.0,
Rahul Iyer,CSK,WK,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",294.0,15.3,135.5,0.0,0.0,24.0,2026.0,
Abhishek Iyer,SRH,BAT,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",311.0,24.3,135.5,0.0,0.0,16.0,2026.0,
Mayank Iyer,MI,BOWL,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",13.0,2.0,85.0,5.0,8.2,8.0,2026.0,
Ashish Iyer,PBKS,AR,,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",345.0,17.3,135.5,22.0,8.2,25.0,2026.0,
Deepak Iyer,RCB,WK,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",362.0,26.6,135.5,0.0,0.0,17.0,2026.0,
Sandeep Iyer,LSG,BAT,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",379.0,52.6,135.5,0.0,0.0,9.0,2026.0,
Amit Iyer,KKR,BOWL,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",21.0,1.0,85.0,23.0,8.2,26.0,2026.0,
Harish Iyer,DC,AR,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",413.0,28.7,135.5,15.0,8.2,18.0,2026.0,
Sachin Iyer,GT,WK,,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",430.0,53.8,135.5,0.0,0.0,10.0,2026.0,
Anil Iyer,,BAT,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",447.0,20.7,135.5,0.0,0.0,27.0,2026.0,
Rajesh Iyer,RR,BOWL,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",29.0,1.9,85.0,16.0,8.2,19.0,2026.0,
Sunil Iyer,CSK,AR,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",481.0,54.7,135.5,8.0,8.2,11.0,2026.0,
Karan Iyer,SRH,WK,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",498.0,22.2,135.5,0.0,0.0,28.0,2026.0,
Aditya Patel,MI,BAT,,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",65.0,4.1,135.5,0.0,0.0,20.0,2026.0,
Rohan Patel,PBKS,BOWL,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",7.0,0.7,85.0,9.0,8.2,12.0,2026.0,
Suresh Patel,RCB,AR,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",99.0,4.3,135.5,26.0,8.2,29.0,2026.0,
Manish Patel,LSG,WK,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",116.0,6.9,135.5,0.0,0.0,21.0,2026.0,
Ketan Patel,KKR,BAT,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",133.0,12.8,135.5,0.0,0.0,13.0,2026.0,
Pranav Patel,DC,BOWL,,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",15.0,3.8,85.0,2.0,8.2,5.0,2026.0,
Rishit Patel,GT,AR,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",167.0,9.5,135.5,19.0,8.2,22.0,2026.0,
Hrishikesh Patel,,WK,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",184.0,16.4,135.5,0.0,0.0,14.0,2026.0,
Vivek Patel,RR,BAT,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",201.0,41.9,135.5,0.0,0.0,6.0,2026.0,
Yashwant Patel,CSK,BOWL,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",23.0,1.2,85.0,20.0,8.2,23.0,2026.0,
Shrey Patel,SRH,AR,,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",235.0,19.6,135.5,12.0,8.2,15.0,2026.0,
Mohit Patel,MI,WK,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",252.0,45.0,135.5,0.0,0.0,7.0,2026.0,
Samarth Patel,PBKS,BAT,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",269.0,14.0,135.5,0.0,0.0,24.0,2026.0,
Siddharth Patel,RCB,BOWL,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",31.0,2.4,85.0,13.0,8.2,16.0,2026.0,
Aniket Patel,LSG,AR,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",303.0,47.3,135.5,5.0,8.2,8.0,2026.0,
Akash Patel,KKR,WK,,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",320.0,16.0,135.5,0.0,0.0,25.0,2026.0,
Kunal Patel,DC,BAT,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",337.0,24.8,135.5,0.0,0.0,17.0,2026.0,
Nikhil Patel,GT,BOWL,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",9.0,1.3,85.0,6.0,8.2,9.0,2026.0,
Devendra Patel,,AR,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",371.0,17.8,135.5,23.0,8.2,26.0,2026.0,
Gaurav Patel,RR,WK,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",388.0,26.9,135.5,0.0,0.0,18.0,2026.0,
Tushar Patel,CSK,BAT,,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",405.0,50.6,135.5,0.0,0.0,10.0,2026.0,
Vikram Patel,SRH,BOWL,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",17.0,0.8,85.0,24.0,8.2,27.0,2026.0,
Dinesh Patel,MI,AR,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",439.0,28.9,135.5,16.0,8.2,19.0,2026.0,
Sanjay Patel,PBKS,WK,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",456.0,51.8,135.5,0.0,0.0,11.0,2026.0,
Arun Patel,RCB,BAT,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",473.0,21.1,135.5,0.0,0.0,28.0,2026.0,
Pankaj Patel,LSG,BOWL,,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",25.0,1.6,85.0,17.0,8.2,20.0,2026.0,
Vijay Patel,KKR,AR,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",57.0,5.9,135.5,9.0,8.2,12.0,2026.0,
Rahul Patel,DC,WK,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",74.0,3.2,135.5,0.0,0.0,29.0,2026.0,
Abhishek Patel,GT,BAT,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",91.0,5.4,135.5,0.0,0.0,21.0,2026.0,
Mayank Patel,,BOWL,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",33.0,3.2,85.0,10.0,8.2,13.0,2026.0,
Ashish Patel,RR,AR,,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",125.0,31.3,135.5,2.0,8.2,5.0,2026.0,
Deepak Patel,CSK,WK,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",142.0,8.1,135.5,0.0,0.0,22.0,2026.0,
Sandeep Patel,SRH,BAT,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",159.0,14.2,135.5,0.0,0.0,14.0,2026.0,
Amit Patel,MI,BOWL,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",11.0,2.3,85.0,3.0,8.2,6.0,2026.0,
Harish Patel,PBKS,AR,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",193.0,10.5,135.5,20.0,8.2,23.0,2026.0,
Sachin Patel,RCB,WK,,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",210.0,17.5,135.5,0.0,0.0,15.0,2026.0,
Anil Patel,LSG,BAT,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",227.0,40.5,135.5,0.0,0.0,7.0,2026.0,
Rajesh Patel,KKR,BOWL,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",19.0,1.0,85.0,21.0,8.2,24.0,2026.0,
Sunil Patel,DC,AR,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",261.0,20.4,135.5,13.0,8.2,16.0,2026.0,
Karan Patel,GT,WK,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",278.0,43.4,135.5,0.0,0.0,8.0,2026.0,
Aditya Yadav,,BAT,,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",295.0,14.8,135.5,0.0,0.0,25.0,2026.0,
Rohan Yadav,RR,BOWL,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",27.0,2.0,85.0,14.0,8.2,17.0,2026.0,
Suresh Yadav,CSK,AR,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",329.0,45.7,135.5,6.0,8.2,9.0,2026.0,
Manish Yadav,SRH,WK,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",346.0,16.6,135.5,0.0,0.0,26.0,2026.0,
Ketan Yadav,MI,BAT,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",363.0,25.2,135.5,0.0,0.0,18.0,2026.0,
Pranav Yadav,PBKS,BOWL,,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",5.0,0.6,85.0,7.0,8.2,10.0,2026.0,
Rishit Yadav,RCB,AR,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",397.0,18.4,135.5,24.0,8.2,27.0,2026.0,
Hrishikesh Yadav,LSG,WK,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",414.0,27.2,135.5,0.0,0.0,19.0,2026.0,
Vivek Yadav,KKR,BAT,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",431.0,49.0,135.5,0.0,0.0,11.0,2026.0,
Yashwant Yadav,DC,BOWL,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",13.0,0.6,85.0,25.0,8.2,28.0,2026.0,
Shrey Yadav,GT,AR,,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",465.0,29.1,135.5,17.0,8.2,20.0,2026.0,
Mohit Yadav,,WK,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",482.0,50.2,135.5,0.0,0.0,12.0,2026.0,
Samarth Yadav,RR,BAT,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",499.0,21.5,135.5,0.0,0.0,29.0,2026.0,
Siddharth Yadav,CSK,BOWL,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",21.0,1.3,85.0,18.0,8.2,21.0,2026.0,
Aniket Yadav,SRH,AR,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",83.0,8.0,135.5,10.0,8.2,13.0,2026.0,
Akash Yadav,MI,WK,,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",100.0,25.0,135.5,0.0,0.0,5.0,2026.0,
Kunal Yadav,PBKS,BAT,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",117.0,6.6,135.5,0.0,0.0,22.0,2026.0,
Nikhil Yadav,RCB,BOWL,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",29.0,2.6,85.0,11.0,8.2,14.0,2026.0,
Devendra Yadav,LSG,AR,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",151.0,31.5,135.5,3.0,8.2,6.0,2026.0,
Gaurav Yadav,KKR,WK,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",168.0,9.1,135.5,0.0,0.0,23.0,2026.0,
Tushar Yadav,DC,BAT,,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",185.0,15.4,135.5,0.0,0.0,15.0,2026.0,
Vikram Yadav,GT,BOWL,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",7.0,1.2,85.0,4.0,8.2,7.0,2026.0,
Dinesh Yadav,,AR,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",219.0,11.4,135.5,21.0,8.2,24.0,2026.0,
Sanjay Yadav,RR,WK,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",236.0,18.4,135.5,0.0,0.0,16.0,2026.0,
Arun Yadav,CSK,BAT,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",253.0,39.5,135.5,0.0,0.0,8.0,2026.0,
Pankaj Yadav,SRH,BOWL,,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",15.0,0.8,85.0,22.0,8.2,25.0,2026.0,
Vijay Yadav,MI,AR,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",287.0,21.1,135.5,14.0,8.2,17.0,2026.0,
Rahul Yadav,PBKS,WK,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",304.0,42.2,135.5,0.0,0.0,9.0,2026.0,
Abhishek Yadav,RCB,BAT,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",321.0,15.4,135.5,0.0,0.0,26.0,2026.0,
Ashish Yadav,KKR,AR,,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",355.0,44.4,135.5,7.0,8.2,10.0,2026.0,
Deepak Yadav,DC,WK,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",372.0,17.2,135.5,0.0,0.0,27.0,2026.0,
Sandeep Yadav,GT,BAT,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",389.0,25.6,135.5,0.0,0.0,19.0,2026.0,
Amit Yadav,,BOWL,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",31.0,3.5,85.0,8.0,8.2,11.0,2026.0,
Harish Yadav,RR,AR,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",423.0,18.9,135.5,25.0,8.2,28.0,2026.0,
Sachin Yadav,CSK,WK,,₹0.50Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",440.0,27.5,135.5,0.0,0.0,20.0,2026.0,
Anil Yadav,SRH,BAT,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",457.0,47.6,135.5,0.0,0.0,12.0,2026.0,
Rajesh Yadav,MI,BOWL,,₹0.20Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",9.0,0.4,85.0,26.0,8.2,29.0,2026.0,
Sunil Yadav,PBKS,AR,,₹0.30Cr,"./IPL Players List - Auction Pool, Roles and Base Prices_files/Kohli.avif",491.0,29.2,135.5,18.0,8.2,21.0,2026.0,
`;

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

export const playersData: Player[] = [];

const fullCsv = [CSV_PART1, CSV_PART2, CSV_PART3, CSV_PART4, CSV_PART5].join('\n');
const lines = fullCsv.split('\n');
const seenNames = new Set<string>();

lines.forEach((line) => {
  const trimmed = line.trim();
  if (!trimmed) return;
  // Skip header if it is exactly the header line
  if (trimmed.startsWith('Name,Team,Role,Country,BasePrice,Image')) return;

  const cols = parseCsvLine(trimmed);
  if (cols.length < 5) return;

  const name = cols[0].trim();
  if (!name) return;

  // De-duplicate players with the same name
  if (seenNames.has(name)) return;
  seenNames.add(name);

  const team = cols[1].trim() || 'None';
  const rawRole = cols[2].trim();
  let country = cols[3].trim();
  if (!country) country = 'India';

  const basePrice = cols[4].trim();
  const image = cols[5].trim();
  
  const runs = parseFloat(cols[6]) || 0;
  const average = parseFloat(cols[7]) || 0;
  const strikeRate = parseFloat(cols[8]) || 0;
  const wickets = parseFloat(cols[9]) || 0;
  const economy = parseFloat(cols[10]) || 0;
  const matches = parseFloat(cols[11]) || 0;
  const latestSeason = parseFloat(cols[12]) || 2026;

  // Determine countryType
  const countryType = country.toLowerCase() === 'india' ? PlayerCountryType.Indian : PlayerCountryType.Overseas;

  // Map role
  let role = PlayerRole.Batter;
  const rl = rawRole.toLowerCase();
  if (rl.includes('wk') || rl.includes('keeper')) {
    role = PlayerRole.WicketKeeper;
  } else if (rl.includes('ar') || rl.includes('round')) {
    role = PlayerRole.AllRounder;
  } else if (rl.includes('bowl') || rl.includes('bowler')) {
    role = PlayerRole.Bowler;
  } else if (rl.includes('bat') || rl.includes('batter')) {
    role = PlayerRole.Batter;
  }

  // Parse Base Price (Lakhs)
  let basePriceLakhs = 20; // fallback
  if (basePrice) {
    const match = basePrice.match(/₹?([0-9\.]+)Cr/i);
    if (match) {
      basePriceLakhs = Math.round(parseFloat(match[1]) * 100);
    } else {
      const matchLakh = basePrice.match(/₹?([0-9\.]+)L/i);
      if (matchLakh) {
        basePriceLakhs = Math.round(parseFloat(matchLakh[1]));
      }
    }
  } else {
    // If empty basePrice, default to something based on their runs/wickets or standard
    basePriceLakhs = runs > 2000 || wickets > 100 ? 150 : 50;
  }

  // Parse cricbuzzId from image path if it exists
  let cricbuzzId: number | undefined = undefined;
  if (image) {
    const match = image.match(/(\d+)\.(png|jpg|jpeg|webp|avif)/i);
    if (match) {
      cricbuzzId = parseInt(match[1], 10);
    }
  }

  // ID
  const playerId = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  // Batting/Bowling styles
  let battingStyle = 'Right-handed';
  let bowlingStyle = 'None';

  // Seeded deterministic styles based on name char codes so they are completely stable
  const seedVal = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  if (role === PlayerRole.Batter) {
    battingStyle = seedVal % 5 === 0 ? 'Left-handed' : 'Right-handed';
    bowlingStyle = 'None';
  } else if (role === PlayerRole.Bowler) {
    battingStyle = seedVal % 8 === 0 ? 'Left-handed' : 'Right-handed';
    const bowTypes = [
      'Right-arm fast-medium', 
      'Right-arm off-spin', 
      'Right-arm leg-spin', 
      'Left-arm fast-medium',
      'Left-arm orthodox'
    ];
    bowlingStyle = bowTypes[seedVal % bowTypes.length];
  } else if (role === PlayerRole.AllRounder) {
    battingStyle = seedVal % 4 === 0 ? 'Left-handed' : 'Right-handed';
    const bowTypes = ['Right-arm fast-medium', 'Right-arm off-spin', 'Right-arm leg-spin', 'Left-arm orthodox'];
    bowlingStyle = bowTypes[seedVal % bowTypes.length];
  } else if (role === PlayerRole.WicketKeeper) {
    battingStyle = seedVal % 5 === 0 ? 'Left-handed' : 'Right-handed';
    bowlingStyle = 'None';
  }

  const age = 20 + (seedVal % 16); // between 20 and 35

  const profileImage = image.startsWith('http') ? image : `/api/player-photo/${playerId}`;

  playersData.push({
    id: playerId,
    name,
    country,
    countryType,
    role,
    battingStyle,
    bowlingStyle,
    previousTeam: team,
    basePriceLakhs,
    status: PlayerPlayingStatus.Active,
    age,
    profileImage,
    cricbuzzId,
    stats: {
      matches: Math.round(matches),
      runs: Math.round(runs),
      wickets: Math.round(wickets),
      average,
      strikeRate
    },
    seasons: latestSeason ? [Math.round(latestSeason)] : [2026]
  });
});
