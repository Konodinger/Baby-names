#### Quick testing

To start a demo server :
```
python -m http.server 8080
```


First visualization: we observe the evolution of name attribution over time.



As the number of baby changes every year, we cannot compare popularity over different years just by looking at the number of time a name is given. The visualization thus studies both the occurrence of names (the number of times they were given) and their “popularity” (on a given year, the frequency of baby with the given name).

There are three interconnected representation in this visualization. The first one represents the evolution of popularity over time for one or multiple names (in that case it is the sum of frequencies). It is useful for finding when a name was the most (or least) popular, and to check if this (un)popularity was brief of constant.


The second representation is a word cloud. By filtering the year with the previous representation, we can quickly see what were the trends of some eras. For instance, we can see that Sandrine's max popularity was on a really small period. And by checking the word cloud, we can also see that it was indeed one of the most common name of the early 70's, with Christophe, Stéphane, etc. Notice that here we are observing the occurrence and not the popularity.



The third representation shows a bit more detail about the popularity. We can compare (on a period) the mean popularity of names and their standard deviation. The deviation is a clue: a name with a high deviation will certainly have an unconsistant popularity (like for Sandrine), and the ranking will help find those unconsistancies.
